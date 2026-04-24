-- =============================================================================
-- V12__test_case_stats.sql
-- Statistics table and triggers for test cases.
-- Aggregates over all versions of a test case.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Stats table (one-to-one with test_cases)
-- -----------------------------------------------------------------------------
CREATE TABLE test_case_stats (
    test_case_id BIGINT PRIMARY KEY,
    total_versions INT NOT NULL DEFAULT 0,
    total_executions INT NOT NULL DEFAULT 0,
    last_execution_status VARCHAR(20),
    last_executed_at TIMESTAMPTZ,
    passed_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    blocked_count INT NOT NULL DEFAULT 0,
    not_run_count INT NOT NULL DEFAULT 0,
    stats_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_case_stats_case
        FOREIGN KEY (test_case_id) REFERENCES test_cases(test_case_id) ON DELETE CASCADE,
    CONSTRAINT chk_case_last_execution_status
        CHECK (last_execution_status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

CREATE INDEX idx_case_stats_status ON test_case_stats(last_execution_status);
CREATE INDEX idx_case_stats_updated ON test_case_stats(stats_updated_at);

-- -----------------------------------------------------------------------------
-- 2. Trigger: create an empty stats row when a new test case is inserted
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_test_case_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO test_case_stats (test_case_id)
    VALUES (NEW.test_case_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_case_stats
    AFTER INSERT ON test_cases
    FOR EACH ROW
    EXECUTE FUNCTION create_test_case_stats();

-- -----------------------------------------------------------------------------
-- 3. Function: recalculate test case stats from all versions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_test_case_stats(p_case_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_versions INT;
    v_total_executions INT;
    v_last_status VARCHAR(20);
    v_last_executed_at TIMESTAMPTZ;
    v_passed INT;
    v_failed INT;
    v_blocked INT;
    v_not_run INT;
BEGIN
    -- Count versions
    SELECT COUNT(*) INTO v_total_versions
    FROM test_case_versions
    WHERE test_case_id = p_case_id;

    -- Aggregate from version stats
    SELECT
        COALESCE(SUM(tcvs.total_executions), 0),
        COALESCE(SUM(tcvs.passed_count), 0),
        COALESCE(SUM(tcvs.failed_count), 0),
        COALESCE(SUM(tcvs.blocked_count), 0),
        COALESCE(SUM(tcvs.not_run_count), 0)
    INTO
        v_total_executions,
        v_passed,
        v_failed,
        v_blocked,
        v_not_run
    FROM test_case_version_stats tcvs
    INNER JOIN test_case_versions tcv ON tcvs.test_case_version_id = tcv.test_case_version_id
    WHERE tcv.test_case_id = p_case_id;

    -- Latest execution across all versions
    SELECT tri.status, tri.executed_at
    INTO v_last_status, v_last_executed_at
    FROM test_run_items tri
    INNER JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
    WHERE tcv.test_case_id = p_case_id
      AND tri.executed_at IS NOT NULL
    ORDER BY tri.executed_at DESC
    LIMIT 1;

    UPDATE test_case_stats
    SET
        total_versions = v_total_versions,
        total_executions = v_total_executions,
        passed_count = v_passed,
        failed_count = v_failed,
        blocked_count = v_blocked,
        not_run_count = v_not_run,
        last_execution_status = v_last_status,
        last_executed_at = v_last_executed_at,
        stats_updated_at = CURRENT_TIMESTAMP
    WHERE test_case_id = p_case_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Trigger: update test case stats when version stats change
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_case_stats_on_version_stats_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_case_id BIGINT;
BEGIN
    SELECT tcv.test_case_id INTO v_case_id
    FROM test_case_versions tcv
    WHERE tcv.test_case_version_id = NEW.test_case_version_id;

    IF v_case_id IS NOT NULL THEN
        PERFORM recalculate_test_case_stats(v_case_id);
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_case_stats_on_version_stats
    AFTER UPDATE OF total_executions, passed_count, failed_count, blocked_count,
                  not_run_count, last_execution_status, last_executed_at
    ON test_case_version_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_case_stats_on_version_stats_change();

-- -----------------------------------------------------------------------------
-- 5. Trigger: update test case stats when a new version is created or deleted
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_case_stats_on_version_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_case_id BIGINT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_case_id := OLD.test_case_id;
    ELSE
        v_case_id := NEW.test_case_id;
    END IF;

    PERFORM recalculate_test_case_stats(v_case_id);
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_case_stats_on_version
    AFTER INSERT OR DELETE
    ON test_case_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_case_stats_on_version_change();

-- -----------------------------------------------------------------------------
-- 6. Initialize stats for existing test cases
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT test_case_id FROM test_cases LOOP
        INSERT INTO test_case_stats (test_case_id)
        VALUES (r.test_case_id)
        ON CONFLICT (test_case_id) DO NOTHING;

        PERFORM recalculate_test_case_stats(r.test_case_id);
    END LOOP;
END $$;