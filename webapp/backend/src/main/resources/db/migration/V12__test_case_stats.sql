-- =============================================================================
-- V12__test_case_plan_stats.sql
-- Statistics table and triggers for test cases, scoped per test plan.
-- Replaces the global test_case_stats with plan-dependent stats,
-- analogous to test_suite_plan_stats.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 2. New plan-scoped table
-- -----------------------------------------------------------------------------
CREATE TABLE test_case_plan_stats (
    test_case_id UUID NOT NULL,
    test_plan_id UUID NOT NULL,

    total_executions INT NOT NULL DEFAULT 0,
    last_execution_status VARCHAR(20),
    last_executed_at TIMESTAMPTZ,
    passed_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    blocked_count INT NOT NULL DEFAULT 0,
    not_run_count INT NOT NULL DEFAULT 0,
    stats_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (test_case_id, test_plan_id),

    CONSTRAINT fk_tcps_case
        FOREIGN KEY (test_case_id) REFERENCES test_cases(public_uuid) ON DELETE CASCADE,
    CONSTRAINT fk_tcps_plan
        FOREIGN KEY (test_plan_id) REFERENCES test_plans(public_uuid) ON DELETE CASCADE,
    CONSTRAINT chk_tcps_status
        CHECK (last_execution_status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

CREATE INDEX idx_tcps_case ON test_case_plan_stats(test_case_id);
CREATE INDEX idx_tcps_plan ON test_case_plan_stats(test_plan_id);

-- -----------------------------------------------------------------------------
-- 3. Recalculation function for a single (test_case, test_plan) pair
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalc_test_case_plan_stats(
    p_case_uuid UUID,
    p_plan_uuid UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_total INT;
    v_passed INT;
    v_failed INT;
    v_blocked INT;
    v_not_run INT;
    v_last_status VARCHAR(20);
    v_last_exec_at TIMESTAMPTZ;
BEGIN
    -- Aggregate all run items for this test case within the given plan
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE tri.status = 'PASSED'),
        COUNT(*) FILTER (WHERE tri.status = 'FAILED'),
        COUNT(*) FILTER (WHERE tri.status = 'BLOCKED'),
        COUNT(*) FILTER (WHERE tri.status = 'NOT_RUN')
    INTO
        v_total,
        v_passed,
        v_failed,
        v_blocked,
        v_not_run
    FROM test_run_items tri
    JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
    JOIN test_plans tp ON tpr.test_plan_id = tp.test_plan_id
    JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
    JOIN test_cases tc ON tcv.test_case_id = tc.test_case_id
    WHERE tp.public_uuid = p_plan_uuid
      AND tc.public_uuid = p_case_uuid;

    -- Latest execution (if any)
    SELECT tri.status, tri.executed_at
    INTO v_last_status, v_last_exec_at
    FROM test_run_items tri
    JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
    JOIN test_plans tp ON tpr.test_plan_id = tp.test_plan_id
    JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
    JOIN test_cases tc ON tcv.test_case_id = tc.test_case_id
    WHERE tp.public_uuid = p_plan_uuid
      AND tc.public_uuid = p_case_uuid
      AND tri.executed_at IS NOT NULL
    ORDER BY tri.executed_at DESC
    LIMIT 1;

    INSERT INTO test_case_plan_stats AS t (
        test_case_id, test_plan_id,
        total_executions, passed_count, failed_count, blocked_count, not_run_count,
        last_execution_status, last_executed_at, stats_updated_at
    )
    VALUES (
        p_case_uuid, p_plan_uuid,
        v_total, v_passed, v_failed, v_blocked, v_not_run,
        v_last_status, v_last_exec_at, CURRENT_TIMESTAMP
    )
    ON CONFLICT (test_case_id, test_plan_id)
    DO UPDATE SET
        total_executions = EXCLUDED.total_executions,
        passed_count = EXCLUDED.passed_count,
        failed_count = EXCLUDED.failed_count,
        blocked_count = EXCLUDED.blocked_count,
        not_run_count = EXCLUDED.not_run_count,
        last_execution_status = EXCLUDED.last_execution_status,
        last_executed_at = EXCLUDED.last_executed_at,
        stats_updated_at = EXCLUDED.stats_updated_at;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Trigger on test_run_items to keep plan-scoped stats up to date
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_test_case_plan_stats_on_run_item()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_case_uuid UUID;
    v_plan_uuid UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        SELECT tc.public_uuid, tp.public_uuid
        INTO v_case_uuid, v_plan_uuid
        FROM test_run_items tri
        JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
        JOIN test_cases tc ON tcv.test_case_id = tc.test_case_id
        JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
        JOIN test_plans tp ON tpr.test_plan_id = tp.test_plan_id
        WHERE tri.test_run_item_id = OLD.test_run_item_id;
    ELSE
        SELECT tc.public_uuid, tp.public_uuid
        INTO v_case_uuid, v_plan_uuid
        FROM test_run_items tri
        JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
        JOIN test_cases tc ON tcv.test_case_id = tc.test_case_id
        JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
        JOIN test_plans tp ON tpr.test_plan_id = tp.test_plan_id
        WHERE tri.test_run_item_id = NEW.test_run_item_id;
    END IF;

    IF v_case_uuid IS NOT NULL AND v_plan_uuid IS NOT NULL THEN
        PERFORM recalc_test_case_plan_stats(v_case_uuid, v_plan_uuid);
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_test_case_plan_stats
    AFTER INSERT OR UPDATE OF status, executed_at OR DELETE
    ON test_run_items
    FOR EACH ROW
    EXECUTE FUNCTION update_test_case_plan_stats_on_run_item();

-- -----------------------------------------------------------------------------
-- 5. Initialise stats for all existing test cases and plans
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT DISTINCT tc.public_uuid AS case_uuid, tp.public_uuid AS plan_uuid
        FROM test_run_items tri
        JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
        JOIN test_cases tc ON tcv.test_case_id = tc.test_case_id
        JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
        JOIN test_plans tp ON tpr.test_plan_id = tp.test_plan_id
    LOOP
        PERFORM recalc_test_case_plan_stats(rec.case_uuid, rec.plan_uuid);
    END LOOP;
END $$;