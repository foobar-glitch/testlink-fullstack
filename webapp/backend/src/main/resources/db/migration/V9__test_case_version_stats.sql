-- =============================================================================
-- V9__test_case_version_plan_stats.sql
-- Replaces the global test_case_version_stats with per-plan statistics,
-- analogous to test_suite_plan_stats and test_case_plan_stats.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Clean up old V9 artefacts
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_update_version_stats ON test_run_items;
DROP TRIGGER IF EXISTS trg_update_run_item_after_step ON test_step_results;
DROP TRIGGER IF EXISTS trg_create_version_stats ON test_case_versions;
DROP TRIGGER IF EXISTS trg_create_default_version_content ON test_case_versions;
DROP FUNCTION IF EXISTS update_test_case_version_stats() CASCADE;
DROP FUNCTION IF EXISTS update_run_item_status_from_steps() CASCADE;
DROP FUNCTION IF EXISTS create_test_case_version_stats() CASCADE;
DROP FUNCTION IF EXISTS create_default_version_content() CASCADE;
DROP TABLE IF EXISTS test_case_version_stats CASCADE;

-- -----------------------------------------------------------------------------
-- 2. New plan-scoped version statistics table
-- -----------------------------------------------------------------------------
CREATE TABLE test_case_version_plan_stats (
    test_case_version_id UUID NOT NULL,
    test_plan_id UUID NOT NULL,

    total_executions INT NOT NULL DEFAULT 0,
    last_execution_status VARCHAR(20),
    last_executed_at TIMESTAMPTZ,
    passed_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    blocked_count INT NOT NULL DEFAULT 0,
    not_run_count INT NOT NULL DEFAULT 0,
    stats_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (test_case_version_id, test_plan_id),

    CONSTRAINT fk_vps_version
        FOREIGN KEY (test_case_version_id) REFERENCES test_case_versions(public_uuid) ON DELETE CASCADE,
    CONSTRAINT fk_vps_plan
        FOREIGN KEY (test_plan_id) REFERENCES test_plans(public_uuid) ON DELETE CASCADE,
    CONSTRAINT chk_vps_status
        CHECK (last_execution_status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

CREATE INDEX idx_vps_version ON test_case_version_plan_stats(test_case_version_id);
CREATE INDEX idx_vps_plan    ON test_case_version_plan_stats(test_plan_id);

-- -----------------------------------------------------------------------------
-- 3. Recalculation function for a single (version, plan) pair
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalc_test_case_version_plan_stats(
    p_version_uuid UUID,
    p_plan_uuid    UUID
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
    -- Aggregate all run items using this version within the given plan
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
    WHERE tcv.public_uuid = p_version_uuid
      AND tp.public_uuid = p_plan_uuid;

    -- Latest execution (if any)
    SELECT tri.status, tri.executed_at
    INTO v_last_status, v_last_exec_at
    FROM test_run_items tri
    JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
    JOIN test_plans tp ON tpr.test_plan_id = tp.test_plan_id
    JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
    WHERE tcv.public_uuid = p_version_uuid
      AND tp.public_uuid = p_plan_uuid
      AND tri.executed_at IS NOT NULL
    ORDER BY tri.executed_at DESC
    LIMIT 1;

    INSERT INTO test_case_version_plan_stats AS t (
        test_case_version_id, test_plan_id,
        total_executions, passed_count, failed_count, blocked_count, not_run_count,
        last_execution_status, last_executed_at, stats_updated_at
    )
    VALUES (
        p_version_uuid, p_plan_uuid,
        v_total, v_passed, v_failed, v_blocked, v_not_run,
        v_last_status, v_last_exec_at, CURRENT_TIMESTAMP
    )
    ON CONFLICT (test_case_version_id, test_plan_id)
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
-- 4. Trigger on test_run_items to keep version plan stats up to date
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_version_plan_stats_on_run_item()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_version_uuid UUID;
    v_plan_uuid    UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        SELECT tcv.public_uuid, tp.public_uuid
        INTO v_version_uuid, v_plan_uuid
        FROM test_run_items tri
        JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
        JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
        JOIN test_plans tp ON tpr.test_plan_id = tp.test_plan_id
        WHERE tri.test_run_item_id = OLD.test_run_item_id;
    ELSE
        SELECT tcv.public_uuid, tp.public_uuid
        INTO v_version_uuid, v_plan_uuid
        FROM test_run_items tri
        JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
        JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
        JOIN test_plans tp ON tpr.test_plan_id = tp.test_plan_id
        WHERE tri.test_run_item_id = NEW.test_run_item_id;
    END IF;

    IF v_version_uuid IS NOT NULL AND v_plan_uuid IS NOT NULL THEN
        PERFORM recalc_test_case_version_plan_stats(v_version_uuid, v_plan_uuid);
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_version_plan_stats_on_run_item
    AFTER INSERT OR UPDATE OF status, executed_at OR DELETE
    ON test_run_items
    FOR EACH ROW
    EXECUTE FUNCTION update_version_plan_stats_on_run_item();

-- -----------------------------------------------------------------------------
-- 5. Trigger: update run item status from step results (forwarded from original V9)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_run_item_status_from_steps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_overall_status VARCHAR(20);
BEGIN
    SELECT CASE
        WHEN COUNT(*) FILTER (WHERE status = 'FAILED') > 0 THEN 'FAILED'
        WHEN COUNT(*) FILTER (WHERE status = 'BLOCKED') > 0 THEN 'BLOCKED'
        WHEN COUNT(*) FILTER (WHERE status = 'PASSED') = COUNT(*) THEN 'PASSED'
        ELSE 'NOT_RUN'
    END INTO v_overall_status
    FROM test_step_results
    WHERE test_run_item_id = NEW.test_run_item_id;

    UPDATE test_run_items
    SET status = v_overall_status
    WHERE test_run_item_id = NEW.test_run_item_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_run_item_after_step
    AFTER INSERT OR UPDATE OF status OR DELETE
    ON test_step_results
    FOR EACH ROW
    EXECUTE FUNCTION update_run_item_status_from_steps();

-- -----------------------------------------------------------------------------
-- 6. Trigger: create default content row for every new version (from original V9)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_default_version_content()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO test_case_version_content (
        test_case_version_id,
        title,
        description,
        preconditions,
        expected_result,
        created_by
    )
    SELECT
        NEW.test_case_version_id,
        tc.title,
        tc.description,
        '',
        '',
        1
    FROM test_cases tc
    WHERE tc.test_case_id = NEW.test_case_id
    ON CONFLICT (test_case_version_id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_default_version_content
    AFTER INSERT ON test_case_versions
    FOR EACH ROW
    EXECUTE FUNCTION create_default_version_content();

-- -----------------------------------------------------------------------------
-- 7. Initialise stats for all existing version‑plan combinations
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT DISTINCT tcv.public_uuid AS version_uuid, tp.public_uuid AS plan_uuid
        FROM test_run_items tri
        JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
        JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
        JOIN test_plans tp ON tpr.test_plan_id = tp.test_plan_id
    LOOP
        PERFORM recalc_test_case_version_plan_stats(rec.version_uuid, rec.plan_uuid);
    END LOOP;
END $$;