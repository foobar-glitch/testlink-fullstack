-- ======================================================================
-- V5__init_project_schema.sql
-- Creates project management tables: projects, test_suites, test_cases
-- Assumes V1 already created users table and set_updated_at() function.
-- ======================================================================

-- =========================
-- PROJECTS TABLE
-- =========================
CREATE TABLE projects (
                          project_id BIGSERIAL PRIMARY KEY,
                          key VARCHAR(20) NOT NULL UNIQUE,
                          display_name VARCHAR(255) NOT NULL,
                          description TEXT,
                          status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                          updated_at TIMESTAMPTZ,
                          created_by BIGINT NOT NULL,

                          CONSTRAINT fk_projects_created_by
                              FOREIGN KEY (created_by)
                                  REFERENCES users(user_id)
                                  ON DELETE RESTRICT
);

COMMENT ON TABLE projects IS 'Top-level projects (e.g., "ECU", "AUTH")';
COMMENT ON COLUMN projects.key IS 'Short unique project code (e.g., "ECU")';
COMMENT ON COLUMN projects.status IS 'ACTIVE, ARCHIVED, DELETED';

-- =========================
-- TEST SUITES TABLE
-- =========================
CREATE TABLE test_suites (
                             test_suite_id BIGSERIAL PRIMARY KEY,
                             project_id BIGINT NOT NULL,
                             parent_id BIGINT,
                             name VARCHAR(255) NOT NULL,
                             description TEXT,
                             created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                             updated_at TIMESTAMPTZ,
                             created_by BIGINT NOT NULL,

                             CONSTRAINT fk_test_suites_project
                                 FOREIGN KEY (project_id)
                                     REFERENCES projects(project_id)
                                     ON DELETE CASCADE,
                             CONSTRAINT fk_test_suites_parent
                                 FOREIGN KEY (parent_id)
                                     REFERENCES test_suites(test_suite_id)
                                     ON DELETE CASCADE,
                             CONSTRAINT fk_test_suites_created_by
                                 FOREIGN KEY (created_by)
                                     REFERENCES users(user_id)
                                     ON DELETE RESTRICT
);

COMMENT ON TABLE test_suites IS 'Hierarchical test suites within a project';
COMMENT ON COLUMN test_suites.parent_id IS 'Self-reference for nested suites (NULL = root)';

-- Index for hierarchical queries
CREATE INDEX idx_test_suites_parent ON test_suites(parent_id);
CREATE INDEX idx_test_suites_project ON test_suites(project_id);

-- =========================
-- TEST CASES TABLE
-- =========================
CREATE TABLE test_cases (
                            test_case_id BIGSERIAL PRIMARY KEY,
                            project_id BIGINT NOT NULL,
                            test_suite_id BIGINT NOT NULL,
                            number INT NOT NULL,
                            title VARCHAR(255) NOT NULL,
                            description TEXT,
                            status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            updated_at TIMESTAMPTZ,
                            created_by BIGINT NOT NULL,

                            CONSTRAINT fk_test_cases_project
                                FOREIGN KEY (project_id)
                                    REFERENCES projects(project_id)
                                    ON DELETE CASCADE,
                            CONSTRAINT fk_test_cases_test_suite
                                FOREIGN KEY (test_suite_id)
                                    REFERENCES test_suites(test_suite_id)
                                    ON DELETE CASCADE,
                            CONSTRAINT fk_test_cases_created_by
                                FOREIGN KEY (created_by)
                                    REFERENCES users(user_id)
                                    ON DELETE RESTRICT,
                            CONSTRAINT uk_test_case_project_number
                                UNIQUE (project_id, number),
                            CONSTRAINT chk_test_case_status
                                CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED'))
);

COMMENT ON COLUMN test_cases.status IS 'Current state: DRAFT, ACTIVE, DEPRECATED';

COMMENT ON TABLE test_cases IS 'Individual test cases, numbered per project';
COMMENT ON COLUMN test_cases.number IS 'Project-scoped test case number (e.g., 1221 in ECU-1221)';

-- Indexes for performance
CREATE INDEX idx_test_cases_project ON test_cases(project_id);
CREATE INDEX idx_test_cases_test_suite ON test_cases(test_suite_id);
CREATE INDEX idx_test_cases_project_number ON test_cases(project_id, number);

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

