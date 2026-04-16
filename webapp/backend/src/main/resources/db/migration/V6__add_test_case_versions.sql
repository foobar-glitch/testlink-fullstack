-- =========================
-- TEST CASE VERSIONS TABLE
-- =========================
CREATE TABLE test_case_versions (
                                    test_case_version_id BIGSERIAL PRIMARY KEY,
                                    test_case_id BIGINT NOT NULL,
                                    version_number INT NOT NULL,
                                    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                    created_by BIGINT NOT NULL,

                                    CONSTRAINT fk_test_case_versions_test_case
                                        FOREIGN KEY (test_case_id)
                                            REFERENCES test_cases(test_case_id)
                                            ON DELETE CASCADE,
                                    CONSTRAINT fk_test_case_versions_created_by
                                        FOREIGN KEY (created_by)
                                            REFERENCES users(user_id)
                                            ON DELETE RESTRICT,
                                    CONSTRAINT uk_test_case_version
                                        UNIQUE (test_case_id, version_number),
                                    CONSTRAINT chk_version_status
                                        CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED'))
);

COMMENT ON TABLE test_case_versions IS 'Immutable version history for test cases';
COMMENT ON COLUMN test_case_versions.version_number IS 'Sequential version number per test case (1, 2, 3...)';
COMMENT ON COLUMN test_case_versions.status IS 'Status at the time this version was created';

-- =========================
-- TEST CASE VERSION CONTENT TABLE (One-to-One)
-- =========================
CREATE TABLE test_case_version_content (
                                           test_case_version_id BIGINT PRIMARY KEY,
                                           title VARCHAR(255) NOT NULL,
                                           description TEXT,
                                           preconditions TEXT,
                                           expected_result TEXT,

                                           CONSTRAINT fk_version_content_version
                                               FOREIGN KEY (test_case_version_id)
                                                   REFERENCES test_case_versions(test_case_version_id)
                                                   ON DELETE CASCADE
);

COMMENT ON TABLE test_case_version_content IS 'Detailed content for a specific test case version';
COMMENT ON COLUMN test_case_version_content.title IS 'Snapshot of test case title at this version';
COMMENT ON COLUMN test_case_version_content.description IS 'Full description / steps at this version';
COMMENT ON COLUMN test_case_version_content.preconditions IS 'Any setup required before execution';
COMMENT ON COLUMN test_case_version_content.expected_result IS 'What should happen when test passes';

-- =========================
-- TEST CASE VERSION IMAGES TABLE
-- =========================
CREATE TABLE test_case_version_images (
                                          test_case_version_image_id BIGSERIAL PRIMARY KEY,
                                          test_case_version_id BIGINT NOT NULL,
                                          file_name VARCHAR(255) NOT NULL,
                                          file_path VARCHAR(500) NOT NULL,
                                          alt_text VARCHAR(255),
                                          position INT DEFAULT 0,
                                          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                          CONSTRAINT fk_version_images_version
                                              FOREIGN KEY (test_case_version_id)
                                                  REFERENCES test_case_versions(test_case_version_id)
                                                  ON DELETE CASCADE
);

COMMENT ON TABLE test_case_version_images IS 'Images attached to a specific test case version';
COMMENT ON COLUMN test_case_version_images.file_path IS 'Relative or absolute path to the stored image file';
COMMENT ON COLUMN test_case_version_images.position IS 'Display order of images within the test case version';

-- Index for fast retrieval by version
CREATE INDEX idx_test_case_version_images_version ON test_case_version_images(test_case_version_id);

-- =========================
-- TEST CASE VERSION STEPS TABLE
-- =========================
CREATE TABLE test_case_version_steps (
                                         step_id BIGSERIAL PRIMARY KEY,
                                         test_case_version_id BIGINT NOT NULL,
                                         step_number INT NOT NULL,
                                         step_action TEXT NOT NULL,
                                         expected_result TEXT NOT NULL,
                                         execution VARCHAR(20) DEFAULT 'MANUAL',
                                         created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                                         CONSTRAINT fk_version_steps_version
                                             FOREIGN KEY (test_case_version_id)
                                                 REFERENCES test_case_versions(test_case_version_id)
                                                 ON DELETE CASCADE,
                                         CONSTRAINT uk_version_step_number
                                             UNIQUE (test_case_version_id, step_number),
                                         CONSTRAINT chk_execution_type
                                             CHECK (execution IN ('MANUAL', 'AUTOMATED'))
);

COMMENT ON TABLE test_case_version_steps IS 'Step-by-step instructions for executing a test case version';
COMMENT ON COLUMN test_case_version_steps.step_number IS 'Order of this step within the test case (1, 2, 3...)';
COMMENT ON COLUMN test_case_version_steps.step_action IS 'What the tester should do';
COMMENT ON COLUMN test_case_version_steps.expected_result IS 'What should happen when the action is performed correctly';
COMMENT ON COLUMN test_case_version_steps.execution IS 'Execution type: MANUAL or AUTOMATED';

-- Index for fast retrieval
CREATE INDEX idx_test_case_version_steps_version ON test_case_version_steps(test_case_version_id);


-- Indexes for performance
CREATE INDEX idx_test_case_versions_test_case ON test_case_versions(test_case_id);
CREATE INDEX idx_test_case_versions_created_by ON test_case_versions(created_by);

-- ======================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ======================================================================

-- Test Cases indexes (already partially present; ensure all are included)
CREATE INDEX IF NOT EXISTS idx_test_cases_project ON test_cases(project_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_test_suite ON test_cases(test_suite_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_project_number ON test_cases(project_id, number);
CREATE INDEX IF NOT EXISTS idx_test_cases_status ON test_cases(status);

-- Test Suites indexes (already present; repeat for safety)
CREATE INDEX IF NOT EXISTS idx_test_suites_project ON test_suites(project_id);
CREATE INDEX IF NOT EXISTS idx_test_suites_parent ON test_suites(parent_id);

-- ======================================================================
-- UPDATED_AT TRIGGERS (reuse existing function from V1)
-- ======================================================================

-- Projects trigger
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Test Suites trigger
DROP TRIGGER IF EXISTS trg_test_suites_updated_at ON test_suites;
CREATE TRIGGER trg_test_suites_updated_at
    BEFORE UPDATE ON test_suites
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Test Cases trigger
DROP TRIGGER IF EXISTS trg_test_cases_updated_at ON test_cases;
CREATE TRIGGER trg_test_cases_updated_at
    BEFORE UPDATE ON test_cases
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();