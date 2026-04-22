-- =============================================================================
-- V9__test_case_version_stats.sql
-- Creates the statistics table and triggers to keep it automatically updated.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Stats table (one-to-one with test_case_versions)
-- -----------------------------------------------------------------------------
CREATE TABLE test_case_version_stats (
    test_case_version_id BIGINT PRIMARY KEY,
    total_executions INT NOT NULL DEFAULT 0,
    last_execution_status VARCHAR(20),
    last_executed_at TIMESTAMPTZ,
    passed_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    blocked_count INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_stats_version
        FOREIGN KEY (test_case_version_id) REFERENCES test_case_versions(test_case_version_id) ON DELETE CASCADE,
    CONSTRAINT chk_last_execution_status CHECK (last_execution_status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

-- -----------------------------------------------------------------------------
-- 2. Trigger: create an empty stats row when a new test case version is inserted
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_test_case_version_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO test_case_version_stats (test_case_version_id)
    VALUES (NEW.test_case_version_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_version_stats
    AFTER INSERT ON test_case_versions
    FOR EACH ROW
    EXECUTE FUNCTION create_test_case_version_stats();

-- -----------------------------------------------------------------------------
-- 3. Trigger: update statistics when a test_run_item is modified
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_test_case_version_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_version_id BIGINT;
    v_total INT;
    v_last_status VARCHAR(20);
    v_last_executed_at TIMESTAMPTZ;
    v_passed INT;
    v_failed INT;
    v_blocked INT;
BEGIN
    -- Determine the version ID affected
    IF (TG_OP = 'DELETE') THEN
        v_version_id := OLD.test_case_version_id;
    ELSE
        v_version_id := NEW.test_case_version_id;
    END IF;

    -- Recalculate aggregate values for this version
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'PASSED'),
        COUNT(*) FILTER (WHERE status = 'FAILED'),
        COUNT(*) FILTER (WHERE status = 'BLOCKED')
    INTO
        v_total,
        v_passed,
        v_failed,
        v_blocked
    FROM test_run_items
    WHERE test_case_version_id = v_version_id;

    -- Get the latest execution (based on executed_at)
    SELECT status, executed_at
    INTO v_last_status, v_last_executed_at
    FROM test_run_items
    WHERE test_case_version_id = v_version_id
      AND executed_at IS NOT NULL
    ORDER BY executed_at DESC
    LIMIT 1;

    -- Update the stats row
    UPDATE test_case_version_stats
    SET
        total_executions = v_total,
        passed_count = v_passed,
        failed_count = v_failed,
        blocked_count = v_blocked,
        last_execution_status = v_last_status,
        last_executed_at = v_last_executed_at
    WHERE test_case_version_id = v_version_id;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_version_stats
    AFTER INSERT OR UPDATE OF status, executed_at OR DELETE
    ON test_run_items
    FOR EACH ROW
    EXECUTE FUNCTION update_test_case_version_stats();
	
	
CREATE OR REPLACE FUNCTION update_run_item_status_from_steps()
RETURNS TRIGGER AS $$
DECLARE
    v_overall_status VARCHAR(20);
BEGIN
    -- Determine overall status based on step results for this run item
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_run_item_after_step
    AFTER INSERT OR UPDATE OF status OR DELETE
    ON test_step_results
    FOR EACH ROW
    EXECUTE FUNCTION update_run_item_status_from_steps();

