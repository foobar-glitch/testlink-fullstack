-- ======================================================================
-- V10__test_suite_stats.sql
-- Creates test_suite_plan_stats table, update function, triggers,
-- and initialises statistics for all suites and plans.
-- ======================================================================

-- ----------------------------------------------------------------------
-- 1. Create the statistics table
-- ----------------------------------------------------------------------
CREATE TABLE test_suite_plan_stats (
    test_suite_id UUID NOT NULL,
    test_plan_id  UUID NOT NULL,

    total_child_suites   INT NOT NULL DEFAULT 0,
    total_test_cases     INT NOT NULL DEFAULT 0,
    total_executions     INT NOT NULL DEFAULT 0,
    last_execution_status VARCHAR(20),
    last_executed_at       TIMESTAMPTZ,
    passed_count         INT NOT NULL DEFAULT 0,
    failed_count         INT NOT NULL DEFAULT 0,
    blocked_count        INT NOT NULL DEFAULT 0,
    not_run_count        INT NOT NULL DEFAULT 0,
    stats_updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (test_suite_id, test_plan_id),

    CONSTRAINT fk_sps_suite
        FOREIGN KEY (test_suite_id) REFERENCES test_suites(public_uuid) ON DELETE CASCADE,
    CONSTRAINT fk_sps_plan
        FOREIGN KEY (test_plan_id) REFERENCES test_plans(public_uuid) ON DELETE CASCADE,

    CONSTRAINT chk_sps_status
        CHECK (last_execution_status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

CREATE INDEX IF NOT EXISTS idx_sps_plan_id  ON test_suite_plan_stats(test_plan_id);
CREATE INDEX IF NOT EXISTS idx_sps_suite_id ON test_suite_plan_stats(test_suite_id);

-- ----------------------------------------------------------------------
-- 2. recalc function
--
-- FIX: The original function used three separate SQL statements that all
-- referenced the CTEs suite_tree and plan_runs. In PostgreSQL (and
-- PL/pgSQL), a WITH clause only lives for the single statement it is
-- attached to. Once that statement finishes, the CTE name ceases to
-- exist, so any subsequent bare SELECT that tries to JOIN suite_tree
-- fails with "relation suite_tree does not exist".
--
-- Solution: merge all aggregation work into one statement by using
-- additional CTEs (exec_agg, latest_exec) so the whole computation
-- runs inside a single SELECT … INTO.
-- ----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalc_suite_plan_stats(
    p_suite_id UUID,
    p_plan_id  UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_cases       INT;
    v_total_execs       INT;
    v_passed            INT;
    v_failed            INT;
    v_blocked           INT;
    v_not_run           INT;
    v_last_status       VARCHAR(20);
    v_last_exec_at      TIMESTAMPTZ;
    v_child_suites      INT;
    v_suite_internal_id BIGINT;
BEGIN
    -- Resolve the internal (bigint) PK for the target suite once.
    SELECT test_suite_id
    INTO   v_suite_internal_id
    FROM   test_suites
    WHERE  public_uuid = p_suite_id;

    -- One single statement that keeps suite_tree and plan_runs alive
    -- for every sub-query that needs them.
    WITH RECURSIVE
    suite_tree AS (
        -- anchor: the suite itself
        SELECT test_suite_id
        FROM   test_suites
        WHERE  public_uuid = p_suite_id

        UNION ALL

        -- recursive: all descendants
        SELECT ts.test_suite_id
        FROM   test_suites ts
        JOIN   suite_tree  st ON ts.parent_id = st.test_suite_id
    ),
    plan_runs AS (
        SELECT tpr.test_plan_run_id
        FROM   test_plan_runs tpr
        JOIN   test_plans     tp  ON tp.test_plan_id = tpr.test_plan_id
        WHERE  tp.public_uuid = p_plan_id
    ),
    -- Counts: total test cases in the subtree + direct child suites
    case_agg AS (
        SELECT
            COUNT(DISTINCT tc.test_case_id) AS total_cases,
            COUNT(DISTINCT CASE
                      WHEN ts.parent_id = v_suite_internal_id
                      THEN ts.test_suite_id
                  END)                      AS child_suites
        FROM      test_cases  tc
        JOIN      suite_tree  st ON st.test_suite_id = tc.test_suite_id
        LEFT JOIN test_suites ts ON ts.test_suite_id = tc.test_suite_id
    ),
    -- Execution aggregation across all runs in this plan
    exec_agg AS (
        SELECT
            COUNT(DISTINCT tri.test_run_item_id)                     AS total_execs,
            COUNT(*) FILTER (WHERE tri.status = 'PASSED')            AS passed,
            COUNT(*) FILTER (WHERE tri.status = 'FAILED')            AS failed,
            COUNT(*) FILTER (WHERE tri.status = 'BLOCKED')           AS blocked
        FROM  test_run_items      tri
        JOIN  test_case_versions  tcv ON tcv.test_case_version_id = tri.test_case_version_id
        JOIN  test_cases          tc  ON tc.test_case_id          = tcv.test_case_id
        JOIN  suite_tree          st  ON st.test_suite_id         = tc.test_suite_id
        JOIN  plan_runs           pr  ON pr.test_plan_run_id      = tri.test_run_id
    ),
    -- Latest executed run item in this suite/plan
    latest_exec AS (
        SELECT tri.status, tri.executed_at
        FROM  test_run_items      tri
        JOIN  test_case_versions  tcv ON tcv.test_case_version_id = tri.test_case_version_id
        JOIN  test_cases          tc  ON tc.test_case_id          = tcv.test_case_id
        JOIN  suite_tree          st  ON st.test_suite_id         = tc.test_suite_id
        JOIN  plan_runs           pr  ON pr.test_plan_run_id      = tri.test_run_id
        WHERE tri.executed_at IS NOT NULL
        ORDER BY tri.executed_at DESC
        LIMIT 1
    )
    SELECT
        ca.total_cases,
        ca.child_suites,
        ea.total_execs,
        ea.passed,
        ea.failed,
        ea.blocked,
        le.status,
        le.executed_at
    INTO
        v_total_cases,
        v_child_suites,
        v_total_execs,
        v_passed,
        v_failed,
        v_blocked,
        v_last_status,
        v_last_exec_at
    FROM       case_agg   ca
    CROSS JOIN exec_agg   ea
    LEFT JOIN  latest_exec le ON TRUE;

    v_not_run := GREATEST(
        COALESCE(v_total_execs, 0)
        - (COALESCE(v_passed, 0) + COALESCE(v_failed, 0) + COALESCE(v_blocked, 0)),
        0
    );

    -- Upsert the result
    INSERT INTO test_suite_plan_stats AS t (
        test_suite_id, test_plan_id,
        total_child_suites, total_test_cases, total_executions,
        passed_count, failed_count, blocked_count, not_run_count,
        last_execution_status, last_executed_at, stats_updated_at
    )
    VALUES (
        p_suite_id, p_plan_id,
        COALESCE(v_child_suites, 0), COALESCE(v_total_cases, 0), COALESCE(v_total_execs, 0),
        COALESCE(v_passed, 0), COALESCE(v_failed, 0), COALESCE(v_blocked, 0), COALESCE(v_not_run, 0),
        v_last_status, v_last_exec_at, CURRENT_TIMESTAMP
    )
    ON CONFLICT (test_suite_id, test_plan_id)
    DO UPDATE SET
        total_child_suites    = EXCLUDED.total_child_suites,
        total_test_cases      = EXCLUDED.total_test_cases,
        total_executions      = EXCLUDED.total_executions,
        passed_count          = EXCLUDED.passed_count,
        failed_count          = EXCLUDED.failed_count,
        blocked_count         = EXCLUDED.blocked_count,
        not_run_count         = EXCLUDED.not_run_count,
        last_execution_status = EXCLUDED.last_execution_status,
        last_executed_at      = EXCLUDED.last_executed_at,
        stats_updated_at      = EXCLUDED.stats_updated_at;
END;
$$;

-- ----------------------------------------------------------------------
-- 3. Trigger: update suite-plan stats when a test run item changes
-- ----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_suite_plan_stats_on_run_item_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_plan_id  UUID;
    v_suite_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        SELECT tp.public_uuid, ts.public_uuid INTO v_plan_id, v_suite_id
        FROM   test_plan_runs    tpr
        JOIN   test_plans        tp  ON tpr.test_plan_id             = tp.test_plan_id
        JOIN   test_run_items    tri ON tri.test_run_id              = tpr.test_plan_run_id
        JOIN   test_case_versions tcv ON tcv.test_case_version_id   = tri.test_case_version_id
        JOIN   test_cases         tc  ON tc.test_case_id             = tcv.test_case_id
        JOIN   test_suites        ts  ON ts.test_suite_id            = tc.test_suite_id
        WHERE  tri.test_run_item_id = OLD.test_run_item_id;
    ELSE
        SELECT tp.public_uuid, ts.public_uuid INTO v_plan_id, v_suite_id
        FROM   test_plan_runs    tpr
        JOIN   test_plans        tp  ON tpr.test_plan_id             = tp.test_plan_id
        JOIN   test_run_items    tri ON tri.test_run_id              = tpr.test_plan_run_id
        JOIN   test_case_versions tcv ON tcv.test_case_version_id   = tri.test_case_version_id
        JOIN   test_cases         tc  ON tc.test_case_id             = tcv.test_case_id
        JOIN   test_suites        ts  ON ts.test_suite_id            = tc.test_suite_id
        WHERE  tri.test_run_item_id = NEW.test_run_item_id;
    END IF;

    IF v_plan_id IS NOT NULL AND v_suite_id IS NOT NULL THEN
        PERFORM recalc_suite_plan_stats(v_suite_id, v_plan_id);
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_suite_plan_stats_on_run_item
    AFTER INSERT OR UPDATE OF status, executed_at OR DELETE
    ON test_run_items
    FOR EACH ROW
    EXECUTE FUNCTION update_suite_plan_stats_on_run_item_change();

-- ----------------------------------------------------------------------
-- 4. Initialise stats for all existing suite/plan combinations
-- ----------------------------------------------------------------------
DO $$
DECLARE
    suite_rec RECORD;
    plan_rec  RECORD;
BEGIN
    FOR suite_rec IN SELECT public_uuid FROM test_suites LOOP
        FOR plan_rec IN SELECT public_uuid FROM test_plans LOOP
            PERFORM recalc_suite_plan_stats(suite_rec.public_uuid, plan_rec.public_uuid);
        END LOOP;
    END LOOP;
END $$;