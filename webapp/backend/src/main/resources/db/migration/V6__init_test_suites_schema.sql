-- ======================================================================
-- V6__init_test_suites_schema.sql
-- ======================================================================

-- =========================
-- TEST SUITES TABLE
-- =========================
CREATE TABLE test_suites (
                             test_suite_id BIGSERIAL PRIMARY KEY,
                             public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                             project_id BIGINT NOT NULL,
                             parent_id BIGINT,
                             name VARCHAR(255) NOT NULL,
                             description TEXT,
                             created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                             updated_at TIMESTAMPTZ,
                             created_by BIGINT NOT NULL,

                             CONSTRAINT uq_test_suites_public_uuid UNIQUE (public_uuid),
                             CONSTRAINT fk_test_suites_project
                                 FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
                             CONSTRAINT fk_test_suites_parent
                                 FOREIGN KEY (parent_id) REFERENCES test_suites(test_suite_id) ON DELETE CASCADE,
                             CONSTRAINT fk_test_suites_created_by
                                 FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- =========================
-- TEST CASES TABLE
-- =========================
CREATE TABLE test_cases (
                            test_case_id BIGSERIAL PRIMARY KEY,
                            public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                            project_id BIGINT NOT NULL,
                            test_suite_id BIGINT NOT NULL,
                            identifier_number INT NOT NULL,
                            title VARCHAR(255) NOT NULL,
                            description TEXT,
                            status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            updated_at TIMESTAMPTZ,
                            created_by BIGINT NOT NULL,

                            CONSTRAINT uq_test_cases_public_uuid UNIQUE (public_uuid),
                            CONSTRAINT fk_test_cases_project
                                FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
                            CONSTRAINT fk_test_cases_test_suite
                                FOREIGN KEY (test_suite_id) REFERENCES test_suites(test_suite_id) ON DELETE CASCADE,
                            CONSTRAINT fk_test_cases_created_by
                                FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
                            CONSTRAINT uk_test_case_project_number
                                UNIQUE (project_id, identifier_number),
                            CONSTRAINT chk_test_case_status
                                CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED'))
);

-- =========================
-- TEST CASE VERSIONS TABLE
-- =========================
CREATE TABLE test_case_versions (
                                    test_case_version_id BIGSERIAL PRIMARY KEY,
                                    public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                                    test_case_id BIGINT NOT NULL,
                                    version_number INT NOT NULL,
                                    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                    updated_at TIMESTAMPTZ,
                                    created_by BIGINT NOT NULL,

                                    CONSTRAINT uq_test_case_versions_public_uuid UNIQUE (public_uuid),
                                    CONSTRAINT fk_test_case_versions_test_case
                                        FOREIGN KEY (test_case_id) REFERENCES test_cases(test_case_id) ON DELETE CASCADE,
                                    CONSTRAINT fk_test_case_versions_created_by
                                        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
                                    CONSTRAINT uk_test_case_version
                                        UNIQUE (test_case_id, version_number),
                                    CONSTRAINT chk_version_status
                                        CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED'))
);

-- =========================
-- TEST CASE VERSION CONTENT (One-to-One)
-- =========================
CREATE TABLE test_case_version_content (
                                           test_case_version_id BIGINT PRIMARY KEY,
                                           public_uuid UUID DEFAULT gen_random_uuid() NOT NULL, -- Added for consistency
                                           title VARCHAR(255) NOT NULL,
                                           description TEXT,
                                           preconditions TEXT,
                                           expected_result TEXT,
                                           created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                           updated_at TIMESTAMPTZ,
                                           created_by BIGINT NOT NULL,

                                           CONSTRAINT uq_test_case_version_content_public_uuid UNIQUE (public_uuid),
                                           CONSTRAINT fk_version_content_version
                                               FOREIGN KEY (test_case_version_id) REFERENCES test_case_versions(test_case_version_id) ON DELETE CASCADE,
                                           CONSTRAINT fk_version_content_created_by
                                               FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- =========================
-- TEST CASE VERSION IMAGES
-- =========================
CREATE TABLE test_case_version_images (
                                          test_case_version_image_id BIGSERIAL PRIMARY KEY,
                                          public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                                          test_case_version_id BIGINT NOT NULL,
                                          file_name VARCHAR(255) NOT NULL,
                                          file_path VARCHAR(500) NOT NULL,
                                          alt_text VARCHAR(255),
                                          position INT DEFAULT 0,
                                          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                          updated_at TIMESTAMPTZ,
                                          created_by BIGINT NOT NULL,

                                          CONSTRAINT uq_test_case_version_images_public_uuid UNIQUE (public_uuid),
                                          CONSTRAINT fk_version_images_version
                                              FOREIGN KEY (test_case_version_id) REFERENCES test_case_versions(test_case_version_id) ON DELETE CASCADE,
                                          CONSTRAINT fk_version_images_created_by
                                              FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
                                          CONSTRAINT uk_version_image_file
                                              UNIQUE (test_case_version_id, file_name)
);

-- =========================
-- TEST CASE VERSION STEPS
-- =========================
CREATE TABLE test_case_version_steps (
                                         step_id BIGSERIAL PRIMARY KEY,
                                         public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                                         test_case_version_id BIGINT NOT NULL,
                                         step_number INT NOT NULL,
                                         step_action TEXT NOT NULL,
                                         expected_result TEXT NOT NULL,
                                         execution VARCHAR(20) DEFAULT 'MANUAL',
                                         created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                         updated_at TIMESTAMPTZ,

                                         CONSTRAINT uq_test_case_version_steps_public_uuid UNIQUE (public_uuid),
                                         CONSTRAINT fk_version_steps_version
                                             FOREIGN KEY (test_case_version_id) REFERENCES test_case_versions(test_case_version_id) ON DELETE CASCADE,
                                         CONSTRAINT uk_version_step_number
                                             UNIQUE (test_case_version_id, step_number),
                                         CONSTRAINT chk_execution_type
                                             CHECK (execution IN ('MANUAL', 'AUTOMATED'))
);

-- ======================================================================
-- INDEXES & TRIGGERS (Summary of required logic)
-- ======================================================================

-- Add standard indexes for performance
CREATE INDEX idx_test_suites_public_uuid ON test_suites(public_uuid);
CREATE INDEX idx_test_cases_public_uuid ON test_cases(public_uuid);
CREATE INDEX idx_test_case_versions_public_uuid ON test_case_versions(public_uuid);

-- Trigger Applications
CREATE TRIGGER trg_test_suites_updated_at BEFORE UPDATE ON test_suites FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_test_cases_updated_at BEFORE UPDATE ON test_cases FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_test_case_versions_updated_at BEFORE UPDATE ON test_case_versions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_test_case_version_content_updated_at BEFORE UPDATE ON test_case_version_content FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_test_case_version_images_updated_at BEFORE UPDATE ON test_case_version_images FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_test_case_version_steps_updated_at BEFORE UPDATE ON test_case_version_steps FOR EACH ROW EXECUTE FUNCTION set_updated_at();