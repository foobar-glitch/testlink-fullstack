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
-- Recalculates stats for a single suite (p_suite_id) within a plan.
-- It always counts the full subtree rooted at p_suite_id, so calling
-- this on a parent suite automatically includes all descendant data.
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
    SELECT test_suite_id
    INTO   v_suite_internal_id
    FROM   test_suites
    WHERE  public_uuid = p_suite_id;

    WITH RECURSIVE
    suite_tree AS (
        SELECT test_suite_id
        FROM   test_suites
        WHERE  public_uuid = p_suite_id

        UNION ALL

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
    exec_agg AS (
        SELECT
            COUNT(DISTINCT tri.test_run_item_id)           AS total_execs,
            COUNT(*) FILTER (WHERE tri.status = 'PASSED')  AS passed,
            COUNT(*) FILTER (WHERE tri.status = 'FAILED')  AS failed,
            COUNT(*) FILTER (WHERE tri.status = 'BLOCKED') AS blocked
        FROM  test_run_items      tri
        JOIN  test_case_versions  tcv ON tcv.test_case_version_id = tri.test_case_version_id
        JOIN  test_cases          tc  ON tc.test_case_id          = tcv.test_case_id
        JOIN  suite_tree          st  ON st.test_suite_id         = tc.test_suite_id
        JOIN  plan_runs           pr  ON pr.test_plan_run_id      = tri.test_run_id
    ),
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
    FROM       case_agg    ca
    CROSS JOIN exec_agg    ea
    LEFT JOIN  latest_exec le ON TRUE;

    v_not_run := GREATEST(
        COALESCE(v_total_execs, 0)
        - (COALESCE(v_passed, 0) + COALESCE(v_failed, 0) + COALESCE(v_blocked, 0)),
        0
    );

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
-- 3. Helper: recalc a suite AND every ancestor up to the root
--
-- Walks the parent_id chain upward from the given suite (by internal
-- bigint PK) and calls recalc_suite_plan_stats for each node.
-- Because recalc always counts the full subtree, a parent row will
-- automatically reflect everything below it after being recalculated.
-- ----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalc_suite_and_ancestors(
    p_suite_internal_id BIGINT,
    p_plan_id           UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    ancestor RECORD;
BEGIN
    FOR ancestor IN
        WITH RECURSIVE ancestors AS (
            SELECT test_suite_id, parent_id, public_uuid
            FROM   test_suites
            WHERE  test_suite_id = p_suite_internal_id

            UNION ALL

            SELECT ts.test_suite_id, ts.parent_id, ts.public_uuid
            FROM   test_suites ts
            JOIN   ancestors   a  ON ts.test_suite_id = a.parent_id
        )
        SELECT public_uuid FROM ancestors
    LOOP
        PERFORM recalc_suite_plan_stats(ancestor.public_uuid, p_plan_id);
    END LOOP;
END;
$$;

-- ----------------------------------------------------------------------
-- 4. Trigger function: fires on test_run_items INSERT/UPDATE/DELETE
--
-- Finds the directly affected suite + plan, then recalcs that suite
-- and every ancestor so every level of the tree stays up to date.
-- ----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_suite_plan_stats_on_run_item_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_plan_id           UUID;
    v_suite_internal_id BIGINT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        SELECT tp.public_uuid, tc.test_suite_id
        INTO   v_plan_id, v_suite_internal_id
        FROM   test_plan_runs     tpr
        JOIN   test_plans         tp  ON tpr.test_plan_id          = tp.test_plan_id
        JOIN   test_run_items     tri ON tri.test_run_id           = tpr.test_plan_run_id
        JOIN   test_case_versions tcv ON tcv.test_case_version_id = tri.test_case_version_id
        JOIN   test_cases         tc  ON tc.test_case_id           = tcv.test_case_id
        WHERE  tri.test_run_item_id = OLD.test_run_item_id;
    ELSE
        SELECT tp.public_uuid, tc.test_suite_id
        INTO   v_plan_id, v_suite_internal_id
        FROM   test_plan_runs     tpr
        JOIN   test_plans         tp  ON tpr.test_plan_id          = tp.test_plan_id
        JOIN   test_run_items     tri ON tri.test_run_id           = tpr.test_plan_run_id
        JOIN   test_case_versions tcv ON tcv.test_case_version_id = tri.test_case_version_id
        JOIN   test_cases         tc  ON tc.test_case_id           = tcv.test_case_id
        WHERE  tri.test_run_item_id = NEW.test_run_item_id;
    END IF;

    IF v_plan_id IS NOT NULL AND v_suite_internal_id IS NOT NULL THEN
        PERFORM recalc_suite_and_ancestors(v_suite_internal_id, v_plan_id);
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
-- 5. Initialise stats for all existing suite/plan combinations
--
-- Process leaves before parents (ORDER BY depth DESC) so that when a
-- parent is recalculated its children already have fresh rows.
-- ----------------------------------------------------------------------
DO $$
DECLARE
    plan_rec  RECORD;
    suite_rec RECORD;
BEGIN
    FOR plan_rec IN SELECT public_uuid FROM test_plans LOOP
        FOR suite_rec IN
            WITH RECURSIVE tree AS (
                SELECT test_suite_id, parent_id, public_uuid, 0 AS depth
                FROM   test_suites
                WHERE  parent_id IS NULL

                UNION ALL

                SELECT ts.test_suite_id, ts.parent_id, ts.public_uuid, t.depth + 1
                FROM   test_suites ts
                JOIN   tree        t  ON ts.parent_id = t.test_suite_id
            )
            SELECT public_uuid FROM tree ORDER BY depth DESC
        LOOP
            PERFORM recalc_suite_plan_stats(suite_rec.public_uuid, plan_rec.public_uuid);
        END LOOP;
    END LOOP;
END $$;