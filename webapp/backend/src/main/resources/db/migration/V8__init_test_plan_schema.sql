-- ======================================================================
-- V8__init_test_plan_schema.sql
-- ======================================================================

-- =========================
-- TEST PLANS TABLE
-- =========================
CREATE TABLE test_plans (
                            test_plan_id BIGSERIAL PRIMARY KEY,
                            public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                            project_id BIGINT NOT NULL,
                            name VARCHAR(255) NOT NULL,
                            description TEXT,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            updated_at TIMESTAMPTZ,
                            created_by BIGINT NOT NULL,

                            CONSTRAINT uq_test_plans_public_uuid UNIQUE (public_uuid),
                            CONSTRAINT fk_test_plans_project
                                FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
                            CONSTRAINT fk_test_plans_created_by
                                FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- =========================
-- TEST PLAN RUNS TABLE
-- =========================
CREATE TABLE test_plan_runs (
                                test_plan_run_id BIGSERIAL PRIMARY KEY,
                                public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                                test_plan_id BIGINT NOT NULL,
                                name VARCHAR(255) NOT NULL,
                                environment VARCHAR(100),
                                build VARCHAR(100),
                                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                updated_at TIMESTAMPTZ,
                                created_by BIGINT NOT NULL,

                                CONSTRAINT uq_test_plan_runs_public_uuid UNIQUE (public_uuid),
                                CONSTRAINT fk_test_plan_runs_test_plan
                                    FOREIGN KEY (test_plan_id) REFERENCES test_plans(test_plan_id) ON DELETE CASCADE,
                                CONSTRAINT fk_test_plan_runs_created_by
                                    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- =========================
-- TEST RUN ITEMS TABLE
-- =========================
CREATE TABLE test_run_items (
                                test_run_item_id BIGSERIAL PRIMARY KEY,
                                public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
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

                                CONSTRAINT uq_test_run_items_public_uuid UNIQUE (public_uuid),
                                CONSTRAINT fk_run_item_run
                                    FOREIGN KEY (test_run_id) REFERENCES test_plan_runs(test_plan_run_id) ON DELETE CASCADE,
                                CONSTRAINT fk_run_item_case
                                    FOREIGN KEY (test_case_id) REFERENCES test_cases(test_case_id) ON DELETE CASCADE,
                                CONSTRAINT fk_run_item_version
                                    FOREIGN KEY (test_case_version_id) REFERENCES test_case_versions(test_case_version_id) ON DELETE CASCADE,
                                CONSTRAINT fk_run_item_assigned_to
                                    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
                                CONSTRAINT fk_run_item_executed_by
                                    FOREIGN KEY (executed_by) REFERENCES users(user_id) ON DELETE SET NULL,
                                CONSTRAINT fk_run_item_created_by
                                    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
                                CONSTRAINT uk_run_item_unique
                                    UNIQUE (test_run_id, test_case_id),
                                CONSTRAINT chk_run_item_status
                                    CHECK (status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

-- =========================
-- TEST STEP RESULTS TABLE
-- =========================
CREATE TABLE test_step_results (
                                   test_step_result_id BIGSERIAL PRIMARY KEY,
                                   public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                                   test_run_item_id BIGINT NOT NULL,
                                   test_case_version_step_id BIGINT NOT NULL,
                                   status VARCHAR(20) NOT NULL DEFAULT 'NOT_RUN',
                                   actual_result TEXT,
                                   notes TEXT,
                                   executed_at TIMESTAMPTZ,
                                   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                   updated_at TIMESTAMPTZ,

                                   CONSTRAINT uq_test_step_results_public_uuid UNIQUE (public_uuid),
                                   CONSTRAINT fk_step_result_run_item
                                       FOREIGN KEY (test_run_item_id) REFERENCES test_run_items(test_run_item_id) ON DELETE CASCADE,
                                   CONSTRAINT fk_step_result_step
                                       FOREIGN KEY (test_case_version_step_id) REFERENCES test_case_version_steps(step_id) ON DELETE CASCADE,
                                   CONSTRAINT uk_step_result_unique
                                       UNIQUE (test_run_item_id, test_case_version_step_id),
                                   CONSTRAINT chk_step_result_status
                                       CHECK (status IN ('NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'))
);

-- ======================================================================
-- INDEXES & TRIGGERS
-- ======================================================================

CREATE INDEX idx_test_plans_public_uuid ON test_plans(public_uuid);
CREATE INDEX idx_test_plan_runs_public_uuid ON test_plan_runs(public_uuid);
CREATE INDEX idx_test_run_items_public_uuid ON test_run_items(public_uuid);
CREATE INDEX idx_test_step_results_public_uuid ON test_step_results(public_uuid);

CREATE TRIGGER trg_test_plans_updated_at BEFORE UPDATE ON test_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_test_plan_runs_updated_at BEFORE UPDATE ON test_plan_runs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_test_run_items_updated_at BEFORE UPDATE ON test_run_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_test_step_results_updated_at BEFORE UPDATE ON test_step_results FOR EACH ROW EXECUTE FUNCTION set_updated_at();