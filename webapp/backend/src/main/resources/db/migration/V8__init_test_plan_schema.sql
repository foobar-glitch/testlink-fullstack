-- ======================================================================
-- V8__init_test_plan_schema.sql
-- Adds test plan management tables: test_plans, test_plan_runs, test_plan_run_cases.
-- Includes enhancements: unique case per run, optional version linking, build tracking.
-- ======================================================================

-- =========================
-- TEST PLANS TABLE
-- =========================
CREATE TABLE test_plans (
                            test_plan_id BIGSERIAL PRIMARY KEY,
                            project_id BIGINT NOT NULL,
                            name VARCHAR(255) NOT NULL,
                            description TEXT,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            updated_at TIMESTAMPTZ,
                            created_by BIGINT NOT NULL,

                            CONSTRAINT fk_test_plans_project
                                FOREIGN KEY (project_id)
                                    REFERENCES projects(project_id)
                                    ON DELETE CASCADE,
                            CONSTRAINT fk_test_plans_created_by
                                FOREIGN KEY (created_by)
                                    REFERENCES users(user_id)
                                    ON DELETE RESTRICT
);

COMMENT ON TABLE test_plans IS 'Test plans group test runs and define testing scope';
COMMENT ON COLUMN test_plans.name IS 'Name of the test plan (e.g., "Sprint 12 Regression")';
COMMENT ON COLUMN test_plans.description IS 'Optional description of the test plan objectives';

CREATE INDEX idx_test_plans_project ON test_plans(project_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_test_plans_updated_at ON test_plans;
CREATE TRIGGER trg_test_plans_updated_at
    BEFORE UPDATE ON test_plans
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- TEST PLAN RUNS TABLE
-- =========================
CREATE TABLE test_plan_runs (
                                test_plan_run_id BIGSERIAL PRIMARY KEY,
                                test_plan_id BIGINT NOT NULL,
                                name VARCHAR(255) NOT NULL,
                                environment VARCHAR(100),
                                build VARCHAR(100),                     -- optional: build/version identifier
                                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                updated_at TIMESTAMPTZ,
                                created_by BIGINT NOT NULL,

                                CONSTRAINT fk_test_plan_runs_test_plan
                                    FOREIGN KEY (test_plan_id)
                                        REFERENCES test_plans(test_plan_id)
                                        ON DELETE CASCADE,
                                CONSTRAINT fk_test_plan_runs_created_by
                                    FOREIGN KEY (created_by)
                                        REFERENCES users(user_id)
                                        ON DELETE RESTRICT
);

COMMENT ON TABLE test_plan_runs IS 'Individual test runs associated with a test plan';
COMMENT ON COLUMN test_plan_runs.name IS 'Name of the test run (e.g., "Chrome - US Region")';
COMMENT ON COLUMN test_plan_runs.environment IS 'Target environment (e.g., "Staging", "Production")';
COMMENT ON COLUMN test_plan_runs.build IS 'Build or release version under test';

CREATE INDEX idx_test_plan_runs_test_plan ON test_plan_runs(test_plan_id);

DROP TRIGGER IF EXISTS trg_test_plan_runs_updated_at ON test_plan_runs;
CREATE TRIGGER trg_test_plan_runs_updated_at
    BEFORE UPDATE ON test_plan_runs
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- TEST PLAN RUN CASES TABLE
-- =========================
CREATE TABLE test_plan_run_cases (
                                     test_plan_run_case_id BIGSERIAL PRIMARY KEY,
                                     test_plan_run_id BIGINT NOT NULL,
                                     test_case_id BIGINT NOT NULL,
                                     test_case_version_id BIGINT,            -- optional: lock to a specific version
                                     status VARCHAR(20) NOT NULL DEFAULT 'NOT_RUN',
                                     assigned_to BIGINT,
                                     executed_at TIMESTAMPTZ,
                                     notes TEXT,
                                     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                     updated_at TIMESTAMPTZ,
                                     created_by BIGINT NOT NULL,

                                     CONSTRAINT fk_run_cases_test_plan_run
                                         FOREIGN KEY (test_plan_run_id)
                                             REFERENCES test_plan_runs(test_plan_run_id)
                                             ON DELETE CASCADE,
                                     CONSTRAINT fk_run_cases_test_case
                                         FOREIGN KEY (test_case_id)
                                             REFERENCES test_cases(test_case_id)
                                             ON DELETE CASCADE,
                                     CONSTRAINT fk_run_cases_test_case_version
                                         FOREIGN KEY (test_case_version_id)
                                             REFERENCES test_case_versions(test_case_version_id)
                                             ON DELETE SET NULL,
                                     CONSTRAINT fk_run_cases_assigned_to
                                         FOREIGN KEY (assigned_to)
                                             REFERENCES users(user_id)
                                             ON DELETE SET NULL,
                                     CONSTRAINT fk_run_cases_created_by
                                         FOREIGN KEY (created_by)
                                             REFERENCES users(user_id)
                                             ON DELETE RESTRICT,
                                     CONSTRAINT uk_run_case_unique
                                         UNIQUE (test_plan_run_id, test_case_id),   -- prevent duplicate cases in the same run
                                     CONSTRAINT chk_run_case_status
                                         CHECK (status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

COMMENT ON TABLE test_plan_run_cases IS 'Execution records for test cases included in a test plan run';
COMMENT ON COLUMN test_plan_run_cases.test_case_version_id IS 'Optional: specific test case version used for this execution';
COMMENT ON COLUMN test_plan_run_cases.status IS 'Current execution status: NOT_RUN, PASSED, FAILED, BLOCKED, SKIPPED';
COMMENT ON COLUMN test_plan_run_cases.assigned_to IS 'User responsible for executing this test case';
COMMENT ON COLUMN test_plan_run_cases.executed_at IS 'When the test case was last executed';
COMMENT ON COLUMN test_plan_run_cases.notes IS 'Execution notes or failure reason';

-- Indexes for performance
CREATE INDEX idx_run_cases_test_plan_run ON test_plan_run_cases(test_plan_run_id);
CREATE INDEX idx_run_cases_test_case ON test_plan_run_cases(test_case_id);
CREATE INDEX idx_run_cases_assigned_to ON test_plan_run_cases(assigned_to);
CREATE INDEX idx_run_cases_status ON test_plan_run_cases(status);   -- for filtering by status

DROP TRIGGER IF EXISTS trg_test_plan_run_cases_updated_at ON test_plan_run_cases;
CREATE TRIGGER trg_test_plan_run_cases_updated_at
    BEFORE UPDATE ON test_plan_run_cases
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();