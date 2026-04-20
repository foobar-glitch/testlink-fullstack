-- ======================================================================
-- V5__init_project_schema.sql
-- Creates project management tables: projects
-- ======================================================================

-- =========================
-- PROJECTS TABLE
-- =========================
CREATE TABLE projects (
                          project_id BIGSERIAL PRIMARY KEY,
                          public_uuid UUID DEFAULT gen_random_uuid() NOT NULL, -- Public identifier
                          project_key VARCHAR(20) NOT NULL UNIQUE,             -- Human-readable ID
                          display_name VARCHAR(255) NOT NULL,
                          description TEXT,
                          status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                          updated_at TIMESTAMPTZ,
                          created_by BIGINT NOT NULL,

                          CONSTRAINT uq_projects_public_uuid UNIQUE (public_uuid),
                          CONSTRAINT fk_projects_created_by
                              FOREIGN KEY (created_by)
                                  REFERENCES users(user_id)
                                  ON DELETE RESTRICT
);

COMMENT ON TABLE projects IS 'Top-level projects (e.g., "ECU", "AUTH")';
COMMENT ON COLUMN projects.project_key IS 'Short unique project code (e.g., "ECU")';
COMMENT ON COLUMN projects.status IS 'ACTIVE, ARCHIVED, DELETED';

-- ======================================================================
-- UPDATED_AT TRIGGERS
-- ======================================================================

-- Projects trigger
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();