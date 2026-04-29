-- =============================================================================
-- V10__test_suite_stats.sql
-- Creates the statistics table and triggers for test suites.
-- Keeps aggregated execution data automatically updated.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Stats table (one-to-one with test_suites)
-- -----------------------------------------------------------------------------
CREATE TABLE test_suite_stats (
                                  test_suite_id BIGINT PRIMARY KEY,
                                  total_test_cases INT NOT NULL DEFAULT 0,
                                  total_executions INT NOT NULL DEFAULT 0,
                                  last_execution_status VARCHAR(20),
                                  last_executed_at TIMESTAMPTZ,
                                  passed_count INT NOT NULL DEFAULT 0,
                                  failed_count INT NOT NULL DEFAULT 0,
                                  blocked_count INT NOT NULL DEFAULT 0,
                                  not_run_count INT NOT NULL DEFAULT 0,
                                  total_child_suites INT NOT NULL DEFAULT 0,          -- NEW column
                                  stats_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                                  CONSTRAINT fk_suite_stats_suite
                                      FOREIGN KEY (test_suite_id) REFERENCES test_suites(test_suite_id) ON DELETE CASCADE,
                                  CONSTRAINT chk_suite_last_execution_status
                                      CHECK (last_execution_status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

-- -----------------------------------------------------------------------------
-- Indexes for efficient queries
-- -----------------------------------------------------------------------------
CREATE INDEX idx_suite_stats_status ON test_suite_stats(last_execution_status);
CREATE INDEX idx_suite_stats_updated ON test_suite_stats(stats_updated_at);

-- -----------------------------------------------------------------------------
-- 2. Trigger: create an empty stats row when a new test suite is inserted
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_test_suite_stats()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO test_suite_stats (test_suite_id)
    VALUES (NEW.test_suite_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_suite_stats
    AFTER INSERT ON test_suites
    FOR EACH ROW
EXECUTE FUNCTION create_test_suite_stats();

-- -----------------------------------------------------------------------------
-- 3. Function: recalculate suite stats from all test cases in the suite
--              (recursive - includes child suites via parent_id)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_test_suite_stats(p_suite_id BIGINT)
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
    v_child_suites INT;
BEGIN
    -- Count total test cases in this suite (recursive - includes child suites)
    WITH RECURSIVE suite_tree AS (
        SELECT test_suite_id FROM test_suites WHERE test_suite_id = p_suite_id
        UNION ALL
        SELECT ts.test_suite_id
        FROM test_suites ts
                 INNER JOIN suite_tree st ON ts.parent_id = st.test_suite_id
    )
    SELECT COUNT(DISTINCT tc.test_case_id)
    INTO v_total_cases
    FROM test_cases tc
    WHERE tc.test_suite_id IN (SELECT test_suite_id FROM suite_tree);

    -- Count direct children of this suite
    SELECT COUNT(*) INTO v_child_suites
    FROM test_suites
    WHERE parent_id = p_suite_id;

    -- Aggregate execution stats from all test case versions in this suite
    WITH RECURSIVE suite_tree AS (
        SELECT test_suite_id FROM test_suites WHERE test_suite_id = p_suite_id
        UNION ALL
        SELECT ts.test_suite_id
        FROM test_suites ts
                 INNER JOIN suite_tree st ON ts.parent_id = st.test_suite_id
    ),
                   suite_versions AS (
                       SELECT tcv.test_case_version_id
                       FROM test_case_versions tcv
                                INNER JOIN test_cases tc ON tcv.test_case_id = tc.test_case_id
                       WHERE tc.test_suite_id IN (SELECT test_suite_id FROM suite_tree)
                   )
    SELECT
        COALESCE(SUM(tcvs.total_executions), 0),
        COALESCE(SUM(tcvs.passed_count), 0),
        COALESCE(SUM(tcvs.failed_count), 0),
        COALESCE(SUM(tcvs.blocked_count), 0)
    INTO
        v_total_executions,
        v_passed,
        v_failed,
        v_blocked
    FROM suite_versions sv
             INNER JOIN test_case_version_stats tcvs ON sv.test_case_version_id = tcvs.test_case_version_id;

    -- Calculate not_run count
    v_not_run := v_total_executions - v_passed - v_failed - v_blocked;

    -- Get the latest execution across all test cases in this suite
    SELECT tri.status, tri.executed_at
    INTO v_last_status, v_last_executed_at
    FROM test_run_items tri
             INNER JOIN test_case_versions tcv ON tri.test_case_version_id = tcv.test_case_version_id
             INNER JOIN test_cases tc ON tcv.test_case_id = tc.test_case_id
    WHERE tc.test_suite_id IN (
        WITH RECURSIVE suite_tree AS (
            SELECT test_suite_id FROM test_suites WHERE test_suite_id = p_suite_id
            UNION ALL
            SELECT ts.test_suite_id
            FROM test_suites ts
                     INNER JOIN suite_tree st ON ts.parent_id = st.test_suite_id
        )
        SELECT test_suite_id FROM suite_tree
    )
      AND tri.executed_at IS NOT NULL
    ORDER BY tri.executed_at DESC
    LIMIT 1;

    -- Update the stats row (now includes child count)
    UPDATE test_suite_stats
    SET
        total_test_cases = v_total_cases,
        total_executions = v_total_executions,
        passed_count = v_passed,
        failed_count = v_failed,
        blocked_count = v_blocked,
        not_run_count = v_not_run,
        last_execution_status = v_last_status,
        last_executed_at = v_last_executed_at,
        total_child_suites = v_child_suites,
        stats_updated_at = CURRENT_TIMESTAMP
    WHERE test_suite_id = p_suite_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Trigger: update suite stats when a test case is inserted/updated/deleted
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_suite_stats_on_test_case_change()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
DECLARE
    v_suite_id BIGINT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_suite_id := OLD.test_suite_id;
    ELSE
        v_suite_id := NEW.test_suite_id;
    END IF;

    PERFORM recalculate_test_suite_stats(v_suite_id);
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_suite_stats_on_test_case
    AFTER INSERT OR UPDATE OF test_suite_id OR DELETE
    ON test_cases
    FOR EACH ROW
EXECUTE FUNCTION update_suite_stats_on_test_case_change();

-- -----------------------------------------------------------------------------
-- 5. Trigger: update suite stats when test case version stats change
--    (This fires when test_run_items change, which cascade to version stats)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_suite_stats_on_version_stats_change()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
DECLARE
    v_suite_id BIGINT;
BEGIN
    SELECT tc.test_suite_id
    INTO v_suite_id
    FROM test_cases tc
             INNER JOIN test_case_versions tcv ON tc.test_case_id = tcv.test_case_id
    WHERE tcv.test_case_version_id = NEW.test_case_version_id;

    IF v_suite_id IS NOT NULL THEN
        PERFORM recalculate_test_suite_stats(v_suite_id);
        PERFORM recalculate_parent_suite_stats(v_suite_id);
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_suite_stats_on_version_stats
    AFTER UPDATE OF total_executions, passed_count, failed_count, blocked_count,
        last_execution_status, last_executed_at
    ON test_case_version_stats
    FOR EACH ROW
EXECUTE FUNCTION update_suite_stats_on_version_stats_change();

-- -----------------------------------------------------------------------------
-- 6. Function: cascade stats update to parent suites (using parent_id)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_parent_suite_stats(p_child_suite_id BIGINT)
    RETURNS VOID
    LANGUAGE plpgsql
AS $$
DECLARE
    v_parent_id BIGINT;
BEGIN
    SELECT parent_id INTO v_parent_id
    FROM test_suites
    WHERE test_suite_id = p_child_suite_id;

    WHILE v_parent_id IS NOT NULL LOOP
            PERFORM recalculate_test_suite_stats(v_parent_id);
            SELECT parent_id INTO v_parent_id
            FROM test_suites
            WHERE test_suite_id = v_parent_id;
        END LOOP;
END;
$$;

-- -----------------------------------------------------------------------------
-- 7. Trigger: cascade stats update when suite hierarchy changes (using parent_id)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_suite_stats_on_hierarchy_change()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        IF OLD.parent_id IS NOT NULL THEN
            PERFORM recalculate_test_suite_stats(OLD.parent_id);
            PERFORM recalculate_parent_suite_stats(OLD.parent_id);
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.parent_id IS NOT NULL AND OLD.parent_id IS DISTINCT FROM NEW.parent_id THEN
            PERFORM recalculate_test_suite_stats(OLD.parent_id);
            PERFORM recalculate_parent_suite_stats(OLD.parent_id);
        END IF;
        IF NEW.parent_id IS NOT NULL THEN
            PERFORM recalculate_test_suite_stats(NEW.parent_id);
            PERFORM recalculate_parent_suite_stats(NEW.parent_id);
        END IF;
    ELSE
        IF NEW.parent_id IS NOT NULL THEN
            PERFORM recalculate_test_suite_stats(NEW.parent_id);
            PERFORM recalculate_parent_suite_stats(NEW.parent_id);
        END IF;
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_suite_stats_on_hierarchy
    AFTER INSERT OR UPDATE OF parent_id OR DELETE
    ON test_suites
    FOR EACH ROW
EXECUTE FUNCTION update_suite_stats_on_hierarchy_change();

-- -----------------------------------------------------------------------------
-- 8. Initialize stats for existing suites
-- -----------------------------------------------------------------------------
DO $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN SELECT test_suite_id FROM test_suites LOOP
                INSERT INTO test_suite_stats (test_suite_id)
                VALUES (r.test_suite_id)
                ON CONFLICT (test_suite_id) DO NOTHING;

                PERFORM recalculate_test_suite_stats(r.test_suite_id);
            END LOOP;
    END $$;