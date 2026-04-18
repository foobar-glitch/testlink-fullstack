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
-- TEST RUN ITEMS TABLE
-- =========================
CREATE TABLE test_run_items (
                                test_run_item_id BIGSERIAL PRIMARY KEY,

                                test_run_id BIGINT NOT NULL,
                                test_case_id BIGINT NOT NULL,
                                test_case_version_id BIGINT NOT NULL,

                                assigned_to BIGINT,
                                executed_by BIGINT,

                                status VARCHAR(20) NOT NULL DEFAULT 'NOT_RUN',

                                executed_at TIMESTAMPTZ,
                                notes TEXT,

                                created_by BIGINT NOT NULL,
                                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                updated_at TIMESTAMPTZ,

                                CONSTRAINT fk_run_item_run
                                    FOREIGN KEY (test_run_id)
                                        REFERENCES test_plan_runs(test_plan_run_id)
                                        ON DELETE CASCADE,

                                CONSTRAINT fk_run_item_case
                                    FOREIGN KEY (test_case_id)
                                        REFERENCES test_cases(test_case_id)
                                        ON DELETE CASCADE,

                                CONSTRAINT fk_run_item_version
                                    FOREIGN KEY (test_case_version_id)
                                        REFERENCES test_case_versions(test_case_version_id)
                                        ON DELETE CASCADE,

                                CONSTRAINT fk_run_item_assigned_to
                                    FOREIGN KEY (assigned_to)
                                        REFERENCES users(user_id)
                                        ON DELETE SET NULL,

                                CONSTRAINT fk_run_item_executed_by
                                    FOREIGN KEY (executed_by)
                                        REFERENCES users(user_id)
                                        ON DELETE SET NULL,

                                CONSTRAINT fk_run_item_created_by
                                    FOREIGN KEY (created_by)
                                        REFERENCES users(user_id)
                                        ON DELETE RESTRICT,

                                CONSTRAINT uk_run_item_unique
                                    UNIQUE (test_run_id, test_case_id),

                                CONSTRAINT chk_run_item_status
                                    CHECK (status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

COMMENT ON TABLE test_run_items IS 'Execution records for test cases included in a test plan run';
COMMENT ON COLUMN test_run_items.test_case_version_id IS 'Specific version of the test case used for this execution (mandatory)';
COMMENT ON COLUMN test_run_items.assigned_to IS 'User responsible for executing this test case';
COMMENT ON COLUMN test_run_items.executed_by IS 'User who actually performed the execution';
COMMENT ON COLUMN test_run_items.status IS 'Execution outcome: NOT_RUN, PASSED, FAILED, BLOCKED, SKIPPED';
COMMENT ON COLUMN test_run_items.executed_at IS 'Timestamp when the execution was performed';
COMMENT ON COLUMN test_run_items.notes IS 'Execution notes, bug IDs, or failure reason';
COMMENT ON COLUMN test_run_items.created_by IS 'User who created this run item record';


-- Indexes for performance
CREATE INDEX idx_run_items_run ON test_run_items(test_run_id);
CREATE INDEX idx_run_items_case ON test_run_items(test_case_id);
CREATE INDEX idx_run_items_version ON test_run_items(test_case_version_id);
CREATE INDEX idx_run_items_assigned_to ON test_run_items(assigned_to);
CREATE INDEX idx_run_items_executed_by ON test_run_items(executed_by);
CREATE INDEX idx_run_items_status ON test_run_items(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_test_run_items_updated_at ON test_run_items;
CREATE TRIGGER trg_test_run_items_updated_at
    BEFORE UPDATE ON test_run_items
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- TEST STEP RESULTS TABLE
-- =========================
CREATE TABLE test_step_results (
                                   test_step_result_id BIGSERIAL PRIMARY KEY,

                                   test_run_item_id BIGINT NOT NULL,
                                   test_case_version_step_id BIGINT NOT NULL,

                                   status VARCHAR(20) NOT NULL DEFAULT 'NOT_RUN',

                                   actual_result TEXT,
                                   notes TEXT,

                                   executed_at TIMESTAMPTZ,

                                   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                   updated_at TIMESTAMPTZ,

                                   CONSTRAINT fk_step_result_run_item
                                       FOREIGN KEY (test_run_item_id)
                                           REFERENCES test_run_items(test_run_item_id)
                                           ON DELETE CASCADE,

                                   CONSTRAINT fk_step_result_step
                                       FOREIGN KEY (test_case_version_step_id)
                                           REFERENCES test_case_version_steps(step_id)
                                           ON DELETE CASCADE,

                                   CONSTRAINT uk_step_result_unique
                                       UNIQUE (test_run_item_id, test_case_version_step_id),

                                   CONSTRAINT chk_step_result_status
                                       CHECK (status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

COMMENT ON TABLE test_step_results IS 'Execution results for individual steps within a test run item';
COMMENT ON COLUMN test_step_results.test_run_item_id IS 'Reference to the parent test run item';
COMMENT ON COLUMN test_step_results.test_case_version_step_id IS 'Reference to the specific test step (from a test case version)';
COMMENT ON COLUMN test_step_results.status IS 'Outcome of this step: NOT_RUN, PASSED, FAILED, BLOCKED, SKIPPED';
COMMENT ON COLUMN test_step_results.actual_result IS 'What actually happened during execution';
COMMENT ON COLUMN test_step_results.notes IS 'Additional comments or failure details';
COMMENT ON COLUMN test_step_results.executed_at IS 'Timestamp when the step was executed';

-- Indexes for performance
CREATE INDEX idx_step_results_run_item ON test_step_results(test_run_item_id);
CREATE INDEX idx_step_results_step ON test_step_results(test_case_version_step_id);
CREATE INDEX idx_step_results_status ON test_step_results(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_test_step_results_updated_at ON test_step_results;
CREATE TRIGGER trg_test_step_results_updated_at
    BEFORE UPDATE ON test_step_results
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();