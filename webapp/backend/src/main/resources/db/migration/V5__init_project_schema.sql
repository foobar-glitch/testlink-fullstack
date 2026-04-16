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


-- ======================================================================
-- UPDATED_AT TRIGGERS (reuse existing function from V1)
-- ======================================================================

-- Projects trigger
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


