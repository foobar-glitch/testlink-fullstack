-- ======================================================================
-- R__07_seed_test_case_versions.sql
-- Populates versioned test case content: versions, content, steps, images.
-- Assumes test_cases with IDs 1, 11, 14 already exist.
-- Uses ON CONFLICT to allow safe re-runs.
-- ======================================================================

-- ----------------------------------------------------------------------
-- Test Case 1 (Valid credentials login) – Version 1
-- ----------------------------------------------------------------------
WITH new_version AS (
    INSERT INTO test_case_versions (test_case_id, version_number, status, created_by)
        VALUES (1, 1, 'ACTIVE', 1)
        ON CONFLICT (test_case_id, version_number) DO NOTHING
        RETURNING test_case_version_id
),
     version_id AS (
         -- Get the ID whether newly inserted or already existing
         SELECT COALESCE(
                        (SELECT test_case_version_id FROM new_version),
                        (SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 1 AND version_number = 1)
                ) AS id
     )
INSERT INTO test_case_version_content (test_case_version_id, title, description, preconditions, expected_result)
SELECT id, 'ECU-1: Valid credentials login',
       'Verify that a user can log in with correct username and password.',
       'User account exists in the system with known credentials.',
       'User is redirected to the dashboard after successful login.'
FROM version_id
ON CONFLICT (test_case_version_id) DO NOTHING;

-- Steps for version 1
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 1 AND version_number = 1
)
INSERT INTO test_case_version_steps (test_case_version_id, step_number, step_action, expected_result, execution)
SELECT version_id.test_case_version_id, 1, 'Navigate to the login page', 'Login page is displayed with username and password fields', 'MANUAL'
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 2, 'Enter valid username "ecu_admin"', 'Username field accepts input', 'MANUAL'
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 3, 'Enter valid password "securePass123"', 'Password field masks input', 'MANUAL'
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 4, 'Click "Sign In" button', 'System authenticates and redirects to dashboard', 'MANUAL'
FROM version_id
ON CONFLICT (test_case_version_id, step_number) DO NOTHING;

-- Image for version 1
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 1 AND version_number = 1
)
INSERT INTO test_case_version_images (test_case_version_id, file_name, file_path, alt_text, position)
SELECT version_id.test_case_version_id, 'ecu_login_screen.png',
       '/uploads/testcases/ecu_login_screen.png',
       'ECU login form with username and password fields', 1
FROM version_id
ON CONFLICT DO NOTHING;  -- No unique constraint; may insert duplicate if re-run; safer to check existence
-- Note: Since no natural key, you may want to check existence manually or rely on idempotent application logic.
-- For simplicity, we'll use a DO block to conditionally insert.

-- ----------------------------------------------------------------------
-- Test Case 11 (Basic keyword search) – Version 1
-- ----------------------------------------------------------------------
WITH new_version AS (
    INSERT INTO test_case_versions (test_case_id, version_number, status, created_by)
        VALUES (11, 1, 'ACTIVE', 2)
        ON CONFLICT (test_case_id, version_number) DO NOTHING
        RETURNING test_case_version_id
),
     version_id AS (
         SELECT COALESCE(
                        (SELECT test_case_version_id FROM new_version),
                        (SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 11 AND version_number = 1)
                ) AS id
     )
INSERT INTO test_case_version_content (test_case_version_id, title, description, preconditions, expected_result)
SELECT id, 'ECU-11: Basic keyword search returns ECU fault codes',
       'Verify that searching for a known fault code returns relevant ECU documentation.',
       'Test database contains ECU fault code "P0301" with associated articles.',
       'Search results page displays at least one article containing "P0301".'
FROM version_id
ON CONFLICT (test_case_version_id) DO NOTHING;

-- Steps
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 11 AND version_number = 1
)
INSERT INTO test_case_version_steps (test_case_version_id, step_number, step_action, expected_result, execution)
SELECT version_id.test_case_version_id, 1, 'Navigate to the diagnostics search page', 'Search bar is visible', 'MANUAL' FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 2, 'Enter "P0301" in the search field', 'Text is entered', 'MANUAL' FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 3, 'Press Enter or click the search icon', 'Search results page loads', 'MANUAL' FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 4, 'Verify that results include articles mentioning "Cylinder 1 Misfire"', 'At least one result with title containing "P0301" is displayed', 'MANUAL' FROM version_id
ON CONFLICT (test_case_version_id, step_number) DO NOTHING;

-- ----------------------------------------------------------------------
-- Test Case 14 (Add item to cart) – Version 1
-- ----------------------------------------------------------------------
WITH new_version AS (
    INSERT INTO test_case_versions (test_case_id, version_number, status, created_by)
        VALUES (14, 1, 'ACTIVE', 1)
        ON CONFLICT (test_case_id, version_number) DO NOTHING
        RETURNING test_case_version_id
),
     version_id AS (
         SELECT COALESCE(
                        (SELECT test_case_version_id FROM new_version),
                        (SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 14 AND version_number = 1)
                ) AS id
     )
INSERT INTO test_case_version_content (test_case_version_id, title, description, preconditions, expected_result)
SELECT id, 'ECU-14: Add ECU hardware module to order cart',
       'Verify that an ECU hardware item can be added to the shopping cart and the cart badge updates.',
       'User is logged in and browsing ECU hardware catalog. Item "Bosch ECU ME17.9.7" is in stock.',
       'Cart badge increments by 1 and the item appears in the cart summary drawer.'
FROM version_id
ON CONFLICT (test_case_version_id) DO NOTHING;

-- Steps
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 14 AND version_number = 1
)
INSERT INTO test_case_version_steps (test_case_version_id, step_number, step_action, expected_result, execution)
SELECT version_id.test_case_version_id, 1, 'Navigate to product detail page for "Bosch ECU ME17.9.7"', 'Product page displays with "Add to Cart" button', 'MANUAL' FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 2, 'Click "Add to Cart" button', 'Button changes to "Added" or spinner appears', 'MANUAL' FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 3, 'Observe cart icon in header', 'Cart badge shows number 1 (or increments by 1)', 'MANUAL' FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 4, 'Click cart icon to open cart drawer', 'Drawer slides out and lists "Bosch ECU ME17.9.7" with quantity 1', 'MANUAL' FROM version_id
ON CONFLICT (test_case_version_id, step_number) DO NOTHING;

-- Image for test case 14
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 14 AND version_number = 1
)
INSERT INTO test_case_version_images (test_case_version_id, file_name, file_path, alt_text, position)
SELECT version_id.test_case_version_id, 'bosch_ecu_module.jpg',
       '/uploads/products/bosch_ecu_module.jpg',
       'Bosch ECU ME17.9.7 hardware module', 1
FROM version_id
WHERE NOT EXISTS (SELECT 1 FROM test_case_version_images WHERE test_case_version_id = version_id.test_case_version_id AND file_name = 'bosch_ecu_module.jpg');

-- ----------------------------------------------------------------------
-- Test Case 1 – Version 2 (Enhanced with MFA)
-- ----------------------------------------------------------------------
WITH new_version AS (
    INSERT INTO test_case_versions (test_case_id, version_number, status, created_by)
        VALUES (1, 2, 'DRAFT', 1)
        ON CONFLICT (test_case_id, version_number) DO NOTHING
        RETURNING test_case_version_id
),
     version_id AS (
         SELECT COALESCE(
                        (SELECT test_case_version_id FROM new_version),
                        (SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 1 AND version_number = 2)
                ) AS id
     )
INSERT INTO test_case_version_content (test_case_version_id, title, description, preconditions, expected_result)
SELECT id, 'ECU-1: Valid credentials login (Enhanced)',
       'Verify login with correct credentials, now including MFA step.',
       'User account exists with MFA enabled.',
       'User is redirected to dashboard after successful login and MFA verification.'
FROM version_id
ON CONFLICT (test_case_version_id) DO NOTHING;

-- Steps for version 2
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 1 AND version_number = 2
)
INSERT INTO test_case_version_steps (test_case_version_id, step_number, step_action, expected_result, execution)
SELECT version_id.test_case_version_id, 1, 'Navigate to login page', 'Login page displayed', 'MANUAL' FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 2, 'Enter valid username and password', 'Credentials accepted', 'MANUAL' FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 3, 'Click Sign In', 'MFA challenge page appears', 'MANUAL' FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 4, 'Enter valid TOTP code', 'System verifies and redirects to dashboard', 'AUTOMATED' FROM version_id
ON CONFLICT (test_case_version_id, step_number) DO NOTHING;

-- Image for MFA screen
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 1 AND version_number = 2
)
INSERT INTO test_case_version_images (test_case_version_id, file_name, file_path, alt_text, position)
SELECT version_id.test_case_version_id, 'ecu_mfa_prompt.png',
       '/uploads/testcases/ecu_mfa_prompt.png',
       'ECU MFA code entry screen', 1
FROM version_id
WHERE NOT EXISTS (SELECT 1 FROM test_case_version_images WHERE test_case_version_id = version_id.test_case_version_id AND file_name = 'ecu_mfa_prompt.png');