-- ======================================================================
-- R__03_seed_projects.sql
-- Populates the projects table with initial mock data.
-- Assumes the projects table already exists (from V5 migration).
-- ======================================================================

INSERT INTO projects (project_id, project_key, display_name, description, status, created_by)
VALUES
    (1, 'ECP', 'E-Commerce Platform', 'Frontend & backend testing for the main shopping platform.', 'ACTIVE', 1),
    (2, 'IOS', 'Mobile App iOS', 'iOS native app test suite covering all user journeys.', 'ACTIVE', 1),
    (3, 'AGW', 'API Gateway', 'REST API integration and contract tests.', 'ACTIVE', 1),
    (4, 'ADM', 'Admin Dashboard', 'Internal admin panel UI and permission tests.', 'ACTIVE', 1)
ON CONFLICT (project_id) DO NOTHING;

-- Reset the sequence to the maximum existing project_id
SELECT setval(pg_get_serial_sequence('projects', 'project_id'), (SELECT MAX(project_id) FROM projects));