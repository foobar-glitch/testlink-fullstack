-- =============================================================================
-- V13__project_stats.sql
-- Project-level statistics, including suite and plan counts.
-- =============================================================================

CREATE TABLE project_stats (
    project_id BIGINT PRIMARY KEY,
    total_test_suites INT NOT NULL DEFAULT 0,          -- new
    total_test_plans  INT NOT NULL DEFAULT 0,          -- new
    total_test_cases INT NOT NULL DEFAULT 0,
    total_executions INT NOT NULL DEFAULT 0,
    last_execution_status VARCHAR(20),
    last_executed_at TIMESTAMPTZ,
    passed_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    blocked_count INT NOT NULL DEFAULT 0,
    not_run_count INT NOT NULL DEFAULT 0,
    stats_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_project_stats_project
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    CONSTRAINT chk_project_last_execution_status
        CHECK (last_execution_status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

-- Indexes
CREATE INDEX idx_project_stats_status ON project_stats(last_execution_status);
CREATE INDEX idx_project_stats_updated ON project_stats(stats_updated_at);

-- -----------------------------------------------------------------------------
-- 2. Trigger: create an empty stats row when a new project is inserted
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_project_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO project_stats (project_id)
    VALUES (NEW.project_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_project_stats
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION create_project_stats();

-- -----------------------------------------------------------------------------
-- 3. Function: recalculate project stats from all relevant tables
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_project_stats(p_project_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_suites INT;
    v_plans  INT;
    v_total_cases INT;
    v_total_executions INT;
    v_last_status VARCHAR(20);
    v_last_executed_at TIMESTAMPTZ;
    v_passed INT;
    v_failed INT;
    v_blocked INT;
    v_not_run INT;
BEGIN
    -- Suite count
    SELECT COUNT(*) INTO v_suites
    FROM test_suites
    WHERE project_id = p_project_id;

    -- Plan count
    SELECT COUNT(*) INTO v_plans
    FROM test_plans
    WHERE project_id = p_project_id;

    -- Aggregate from plan stats
    SELECT
        COALESCE(SUM(tps.total_test_cases), 0),
        COALESCE(SUM(tps.total_executions), 0),
        COALESCE(SUM(tps.passed_count), 0),
        COALESCE(SUM(tps.failed_count), 0),
        COALESCE(SUM(tps.blocked_count), 0),
        COALESCE(SUM(tps.not_run_count), 0)
    INTO
        v_total_cases,
        v_total_executions,
        v_passed,
        v_failed,
        v_blocked,
        v_not_run
    FROM test_plan_stats tps
    INNER JOIN test_plans tp ON tps.test_plan_id = tp.test_plan_id
    WHERE tp.project_id = p_project_id;

    -- Latest execution across all plans in this project
    SELECT tps.last_execution_status, tps.last_executed_at
    INTO v_last_status, v_last_executed_at
    FROM test_plan_stats tps
    INNER JOIN test_plans tp ON tps.test_plan_id = tp.test_plan_id
    WHERE tp.project_id = p_project_id
      AND tps.last_executed_at IS NOT NULL
    ORDER BY tps.last_executed_at DESC
    LIMIT 1;

    UPDATE project_stats
    SET
        total_test_suites = v_suites,
        total_test_plans  = v_plans,
        total_test_cases = v_total_cases,
        total_executions = v_total_executions,
        passed_count = v_passed,
        failed_count = v_failed,
        blocked_count = v_blocked,
        not_run_count = v_not_run,
        last_execution_status = v_last_status,
        last_executed_at = v_last_executed_at,
        stats_updated_at = CURRENT_TIMESTAMP
    WHERE project_id = p_project_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Triggers that keep project stats in sync (plan, suite, plan stats)
-- -----------------------------------------------------------------------------

-- 4a. When a test plan is added/removed/ moved to another project
CREATE OR REPLACE FUNCTION update_project_stats_on_plan_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_project_id BIGINT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_project_id := OLD.project_id;
    ELSE
        v_project_id := NEW.project_id;
    END IF;

    PERFORM recalculate_project_stats(v_project_id);

    -- If the plan was moved, also recalc the old project
    IF (TG_OP = 'UPDATE') AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
        PERFORM recalculate_project_stats(OLD.project_id);
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_project_stats_on_plan
    AFTER INSERT OR UPDATE OF project_id OR DELETE
    ON test_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_project_stats_on_plan_change();

-- 4b. When a test suite is added/removed/ moved to another project
CREATE OR REPLACE FUNCTION update_project_stats_on_suite_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_project_id BIGINT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_project_id := OLD.project_id;
    ELSE
        v_project_id := NEW.project_id;
    END IF;

    PERFORM recalculate_project_stats(v_project_id);

    IF (TG_OP = 'UPDATE') AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
        PERFORM recalculate_project_stats(OLD.project_id);
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_project_stats_on_suite
    AFTER INSERT OR UPDATE OF project_id OR DELETE
    ON test_suites
    FOR EACH ROW
    EXECUTE FUNCTION update_project_stats_on_suite_change();

-- 4c. When plan stats change (execution totals, statuses)
CREATE OR REPLACE FUNCTION update_project_stats_on_plan_stats_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_project_id BIGINT;
BEGIN
    SELECT tp.project_id INTO v_project_id
    FROM test_plans tp
    WHERE tp.test_plan_id = NEW.test_plan_id;

    IF v_project_id IS NOT NULL THEN
        PERFORM recalculate_project_stats(v_project_id);
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_project_stats_on_plan_stats
    AFTER UPDATE OF total_test_cases, total_executions, passed_count,
                  failed_count, blocked_count, not_run_count,
                  last_execution_status, last_executed_at
    ON test_plan_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_project_stats_on_plan_stats_change();

-- -----------------------------------------------------------------------------
-- 5. Initialize stats for existing projects
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT project_id FROM projects LOOP
        INSERT INTO project_stats (project_id)
        VALUES (r.project_id)
        ON CONFLICT (project_id) DO NOTHING;

        PERFORM recalculate_project_stats(r.project_id);
    END LOOP;
END $$;