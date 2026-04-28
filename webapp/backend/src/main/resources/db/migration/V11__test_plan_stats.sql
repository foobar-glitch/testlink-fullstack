-- =============================================================================
-- V11__test_plan_stats.sql
-- Creates the statistics table and triggers for test plans.
-- Keeps aggregated execution data automatically updated.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Stats table (one-to-one with test_plans)
-- -----------------------------------------------------------------------------
CREATE TABLE test_plan_stats (
                                 test_plan_id BIGINT PRIMARY KEY,
                                 total_test_cases INT NOT NULL DEFAULT 0,
                                 total_executions INT NOT NULL DEFAULT 0,
                                 last_execution_status VARCHAR(20),
                                 last_executed_at TIMESTAMPTZ,
                                 passed_count INT NOT NULL DEFAULT 0,
                                 failed_count INT NOT NULL DEFAULT 0,
                                 blocked_count INT NOT NULL DEFAULT 0,
                                 not_run_count INT NOT NULL DEFAULT 0,
                                 stats_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                                 CONSTRAINT fk_plan_stats_plan
                                     FOREIGN KEY (test_plan_id) REFERENCES test_plans(test_plan_id) ON DELETE CASCADE,
                                 CONSTRAINT chk_plan_last_execution_status
                                     CHECK (last_execution_status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

-- -----------------------------------------------------------------------------
-- Indexes for efficient queries
-- -----------------------------------------------------------------------------
CREATE INDEX idx_plan_stats_status ON test_plan_stats(last_execution_status);
CREATE INDEX idx_plan_stats_updated ON test_plan_stats(stats_updated_at);

-- -----------------------------------------------------------------------------
-- 2. Trigger: create an empty stats row when a new test plan is inserted
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_test_plan_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
INSERT INTO test_plan_stats (test_plan_id)
VALUES (NEW.test_plan_id);
RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_plan_stats
    AFTER INSERT ON test_plans
    FOR EACH ROW
    EXECUTE FUNCTION create_test_plan_stats();

-- -----------------------------------------------------------------------------
-- 3. Function: recalculate plan stats from all test runs
--    (Uses JOIN to test_case_versions instead of the removed test_case_id column)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_test_plan_stats(p_plan_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
v_total_cases INT;
    v_total_executions INT;
    v_last_status VARCHAR(20);
    v_last_executed_at TIMESTAMPTZ;
    v_passed INT;
    v_failed INT;
    v_blocked INT;
    v_not_run INT;
BEGIN
    -- Count total unique test cases across all runs in this plan (via version join)
SELECT COUNT(DISTINCT tcv.test_case_id)
INTO v_total_cases
FROM test_run_items tri
         INNER JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
         INNER JOIN test_case_versions tcv ON tcv.test_case_version_id = tri.test_case_version_id
WHERE tpr.test_plan_id = p_plan_id;

-- Aggregate execution stats from all run items in this plan
SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE tri.status = 'PASSED'),
    COUNT(*) FILTER (WHERE tri.status = 'FAILED'),
    COUNT(*) FILTER (WHERE tri.status = 'BLOCKED'),
    COUNT(*) FILTER (WHERE tri.status = 'NOT_RUN')
INTO
    v_total_executions,
    v_passed,
    v_failed,
    v_blocked,
    v_not_run
FROM test_run_items tri
         INNER JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
WHERE tpr.test_plan_id = p_plan_id;

-- Get the latest execution across all runs in this plan
SELECT tri.status, tri.executed_at
INTO v_last_status, v_last_executed_at
FROM test_run_items tri
         INNER JOIN test_plan_runs tpr ON tri.test_run_id = tpr.test_plan_run_id
WHERE tpr.test_plan_id = p_plan_id
  AND tri.executed_at IS NOT NULL
ORDER BY tri.executed_at DESC
    LIMIT 1;

-- Update the stats row
UPDATE test_plan_stats
SET
    total_test_cases = v_total_cases,
    total_executions = v_total_executions,
    passed_count = v_passed,
    failed_count = v_failed,
    blocked_count = v_blocked,
    not_run_count = v_not_run,
    last_execution_status = v_last_status,
    last_executed_at = v_last_executed_at,
    stats_updated_at = CURRENT_TIMESTAMP
WHERE test_plan_id = p_plan_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Trigger: update plan stats when a test run is inserted/updated/deleted
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_plan_stats_on_test_run_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
v_plan_id BIGINT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_plan_id := OLD.test_plan_id;
ELSE
        v_plan_id := NEW.test_plan_id;
END IF;

    PERFORM recalculate_test_plan_stats(v_plan_id);
RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_plan_stats_on_test_run
    AFTER INSERT OR UPDATE OF test_plan_id OR DELETE
                    ON test_plan_runs
                        FOR EACH ROW
                        EXECUTE FUNCTION update_plan_stats_on_test_run_change();

-- -----------------------------------------------------------------------------
-- 5. Trigger: update plan stats when a run item is modified
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_plan_stats_on_run_item_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
v_plan_id BIGINT;
BEGIN
    -- Find the plan via the run item's test run
    IF (TG_OP = 'DELETE') THEN
SELECT tpr.test_plan_id INTO v_plan_id
FROM test_plan_runs tpr
WHERE tpr.test_plan_run_id = OLD.test_run_id;
ELSE
SELECT tpr.test_plan_id INTO v_plan_id
FROM test_plan_runs tpr
WHERE tpr.test_plan_run_id = NEW.test_run_id;
END IF;

    IF v_plan_id IS NOT NULL THEN
        PERFORM recalculate_test_plan_stats(v_plan_id);
END IF;

RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_plan_stats_on_run_item
    AFTER INSERT OR UPDATE OF status, executed_at OR DELETE
                    ON test_run_items
                        FOR EACH ROW
                        EXECUTE FUNCTION update_plan_stats_on_run_item_change();

-- -----------------------------------------------------------------------------
-- 6. Trigger: update plan stats when step results change (cascades to run items)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_plan_stats_on_step_result_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
v_plan_id BIGINT;
BEGIN
    -- Find the plan via: step_result -> run_item -> test_run -> test_plan
    IF (TG_OP = 'DELETE') THEN
SELECT tpr.test_plan_id INTO v_plan_id
FROM test_plan_runs tpr
         INNER JOIN test_run_items tri ON tpr.test_plan_run_id = tri.test_run_id
WHERE tri.test_run_item_id = OLD.test_run_item_id;
ELSE
SELECT tpr.test_plan_id INTO v_plan_id
FROM test_plan_runs tpr
         INNER JOIN test_run_items tri ON tpr.test_plan_run_id = tri.test_run_id
WHERE tri.test_run_item_id = NEW.test_run_item_id;
END IF;

    IF v_plan_id IS NOT NULL THEN
        PERFORM recalculate_test_plan_stats(v_plan_id);
END IF;

RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_plan_stats_on_step_result
    AFTER INSERT OR UPDATE OF status OR DELETE
                    ON test_step_results
                        FOR EACH ROW
                        EXECUTE FUNCTION update_plan_stats_on_step_result_change();

-- -----------------------------------------------------------------------------
-- 7. Initialize stats for existing test plans
-- -----------------------------------------------------------------------------
DO $$
DECLARE
r RECORD;
BEGIN
FOR r IN SELECT test_plan_id FROM test_plans LOOP
                                  -- Ensure stats row exists
    INSERT INTO test_plan_stats (test_plan_id)
         VALUES (r.test_plan_id)
         ON CONFLICT (test_plan_id) DO NOTHING;

-- Recalculate stats
PERFORM recalculate_test_plan_stats(r.test_plan_id);
END LOOP;
END $$;