-- ======================================================================
-- R__04_seed_project_memberships.sql
-- Assigns users to projects with specific roles.
-- Assumes:
--   - users: 1=admin, 2=tester1, 3=tester2
--   - projects: 1=E-Commerce, 2=Mobile App, 3=API Gateway, 4=Admin Dashboard
-- ======================================================================

INSERT INTO project_memberships (project_id, user_id, role)
VALUES
    -- Admin is ADMIN on all projects
    (1, 1, 'ADMIN'),
    (2, 1, 'ADMIN'),
    (3, 1, 'ADMIN'),
    (4, 1, 'ADMIN'),

    -- tester1 is TESTER on E-Commerce and Mobile App
    (1, 2, 'TESTER'),
    (2, 2, 'TESTER'),

    -- tester2 is VIEWER on API Gateway and Admin Dashboard
    (3, 3, 'VIEWER'),
    (4, 3, 'VIEWER')
ON CONFLICT (project_id, user_id) DO NOTHING;