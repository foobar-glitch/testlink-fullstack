-- ======================================================================
-- R__05_seed_test_suites.sql
-- Populates test suites with hierarchical structure.
-- Assumes projects already seeded with IDs 1,2,3.
-- ======================================================================

-- Project 1: E-Commerce Platform (ID 1)
INSERT INTO test_suites (test_suite_id, project_id, parent_id, name, description, created_by)
VALUES
    (1, 1, NULL, 'Authentication', 'Login, register, session tests', 1),
    (2, 1, 1,    'Login Flow', '', 1),
    (3, 1, 1,    'Registration', '', 1),
    (4, 1, NULL, 'Product Catalog', 'Browse, search, filter products', 1),
    (5, 1, 4,    'Search', '', 1),
    (6, 1, 4,    'Filters', '', 1),
    (7, 1, 4,    'Product Detail', '', 1),
    (8, 1, NULL, 'Checkout', 'Cart, payment, order confirmation', 1),
    (9, 1, 8,    'Cart Management', '', 1),
    (10, 1, 8,   'Payment Flow', '', 1)
ON CONFLICT (test_suite_id) DO NOTHING;

-- Project 2: Mobile App iOS (ID 2)
INSERT INTO test_suites (test_suite_id, project_id, parent_id, name, description, created_by)
VALUES
    (11, 2, NULL, 'Onboarding', 'First-run experience', 1),
    (12, 2, NULL, 'Home Feed', 'Main feed tests', 1)
ON CONFLICT (test_suite_id) DO NOTHING;

-- Project 3: API Gateway (ID 3)
INSERT INTO test_suites (test_suite_id, project_id, parent_id, name, description, created_by)
VALUES
    (13, 3, NULL, 'Auth Endpoints', '', 1),
    (14, 3, NULL, 'Products API', '', 1)
ON CONFLICT (test_suite_id) DO NOTHING;

-- Update sequences to avoid primary key collisions on future inserts
SELECT setval(pg_get_serial_sequence('test_suites', 'test_suite_id'), (SELECT MAX(test_suite_id) FROM test_suites));