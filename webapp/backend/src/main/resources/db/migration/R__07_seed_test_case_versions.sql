-- ======================================================================
-- R__07_seed_test_case_versions.sql
-- Populates versioned test case content: versions, content, steps, images.
-- Assumes test_cases with IDs 1, 11, 14 already exist.
-- Includes audit fields (created_by, updated_at) and is fully idempotent.
-- ======================================================================

-- ----------------------------------------------------------------------
-- Test Case 1 (Valid credentials login) – Version 1
-- ----------------------------------------------------------------------
WITH
    -- Ensure the version record exists and capture its ID
    upsert_version AS (
        INSERT INTO test_case_versions (test_case_id, version_number, status, created_by)
            VALUES (1, 1, 'ACTIVE', 1)
            ON CONFLICT (test_case_id, version_number) DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = NOW()
            RETURNING test_case_version_id
    ),
    version_id AS (
        SELECT test_case_version_id FROM upsert_version
        UNION ALL
        SELECT test_case_version_id FROM test_case_versions
        WHERE test_case_id = 1 AND version_number = 1
        LIMIT 1
    )
INSERT INTO test_case_version_content (
    test_case_version_id, title, description, preconditions, expected_result, created_by
)
SELECT
    (SELECT test_case_version_id FROM version_id),
    'ECU-1: Valid credentials login',
    'Verify that a user can log in with correct username and password.',
    'User account exists in the system with known credentials.',
    'User is redirected to the dashboard after successful login.',
    1
ON CONFLICT (test_case_version_id) DO UPDATE SET
                                                 title = EXCLUDED.title,
                                                 description = EXCLUDED.description,
                                                 preconditions = EXCLUDED.preconditions,
                                                 expected_result = EXCLUDED.expected_result,
                                                 updated_at = NOW();

-- Steps for version 1
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions
    WHERE test_case_id = 1 AND version_number = 1
)
INSERT INTO test_case_version_steps (
    test_case_version_id, step_number, step_action, expected_result, execution, created_by
)
SELECT
    version_id.test_case_version_id, 1,
    'Navigate to the login page',
    'Login page is displayed with username and password fields',
    'MANUAL',
    1
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 2,
       'Enter valid username "ecu_admin"',
       'Username field accepts input',
       'MANUAL',
       1
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 3,
       'Enter valid password "securePass123"',
       'Password field masks input',
       'MANUAL',
       1
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 4,
       'Click "Sign In" button',
       'System authenticates and redirects to dashboard',
       'MANUAL',
       1
FROM version_id
ON CONFLICT (test_case_version_id, step_number) DO UPDATE SET
                                                              step_action = EXCLUDED.step_action,
                                                              expected_result = EXCLUDED.expected_result,
                                                              execution = EXCLUDED.execution,
                                                              updated_at = NOW();

-- Image for version 1
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions
    WHERE test_case_id = 1 AND version_number = 1
)
INSERT INTO test_case_version_images (
    test_case_version_id, file_name, file_path, alt_text, position, created_by
)
SELECT
    version_id.test_case_version_id,
    'ecu_login_screen.png',
    '/uploads/testcases/ecu_login_screen.png',
    'ECU login form with username and password fields',
    1,
    1
FROM version_id
ON CONFLICT (test_case_version_id, file_name) DO UPDATE SET
                                                            file_path = EXCLUDED.file_path,
                                                            alt_text = EXCLUDED.alt_text,
                                                            position = EXCLUDED.position,
                                                            updated_at = NOW();

-- ----------------------------------------------------------------------
-- Test Case 11 (Basic keyword search) – Version 1
-- ----------------------------------------------------------------------
WITH
    upsert_version AS (
        INSERT INTO test_case_versions (test_case_id, version_number, status, created_by)
            VALUES (11, 1, 'ACTIVE', 2)
            ON CONFLICT (test_case_id, version_number) DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = NOW()
            RETURNING test_case_version_id
    ),
    version_id AS (
        SELECT test_case_version_id FROM upsert_version
        UNION ALL
        SELECT test_case_version_id FROM test_case_versions
        WHERE test_case_id = 11 AND version_number = 1
        LIMIT 1
    )
INSERT INTO test_case_version_content (
    test_case_version_id, title, description, preconditions, expected_result, created_by
)
SELECT
    (SELECT test_case_version_id FROM version_id),
    'ECU-11: Basic keyword search returns ECU fault codes',
    'Verify that searching for a known fault code returns relevant ECU documentation.',
    'Test database contains ECU fault code "P0301" with associated articles.',
    'Search results page displays at least one article containing "P0301".',
    2
ON CONFLICT (test_case_version_id) DO UPDATE SET
                                                 title = EXCLUDED.title,
                                                 description = EXCLUDED.description,
                                                 preconditions = EXCLUDED.preconditions,
                                                 expected_result = EXCLUDED.expected_result,
                                                 updated_at = NOW();
-- Steps for version 11
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions
    WHERE test_case_id = 11 AND version_number = 1
)
INSERT INTO test_case_version_steps (
    test_case_version_id, step_number, step_action, expected_result, execution, created_by
)
SELECT version_id.test_case_version_id, 1,
       'Navigate to the diagnostics search page',
       'Search bar is visible',
       'MANUAL',
       2   -- created by tester1
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 2,
       'Enter "P0301" in the search field',
       'Text is entered',
       'MANUAL',
       2
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 3,
       'Press Enter or click the search icon',
       'Search results page loads',
       'MANUAL',
       2
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 4,
       'Verify that results include articles mentioning "Cylinder 1 Misfire"',
       'At least one result with title containing "P0301" is displayed',
       'MANUAL',
       2
FROM version_id
ON CONFLICT (test_case_version_id, step_number) DO UPDATE SET
                                                              step_action = EXCLUDED.step_action,
                                                              expected_result = EXCLUDED.expected_result,
                                                              execution = EXCLUDED.execution,
                                                              updated_at = NOW();
-- ----------------------------------------------------------------------
-- Test Case 14 (Add item to cart) – Version 1
-- ----------------------------------------------------------------------
WITH
    upsert_version AS (
        INSERT INTO test_case_versions (test_case_id, version_number, status, created_by)
            VALUES (14, 1, 'ACTIVE', 1)
            ON CONFLICT (test_case_id, version_number) DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = NOW()
            RETURNING test_case_version_id
    ),
    version_id AS (
        SELECT test_case_version_id FROM upsert_version
        UNION ALL
        SELECT test_case_version_id FROM test_case_versions
        WHERE test_case_id = 14 AND version_number = 1
        LIMIT 1
    )
INSERT INTO test_case_version_content (
    test_case_version_id, title, description, preconditions, expected_result, created_by
)
SELECT
    (SELECT test_case_version_id FROM version_id),
    'ECU-14: Add ECU hardware module to order cart',
    'Verify that an ECU hardware item can be added to the shopping cart and the cart badge updates.',
    'User is logged in and browsing ECU hardware catalog. Item "Bosch ECU ME17.9.7" is in stock.',
    'Cart badge increments by 1 and the item appears in the cart summary drawer.',
    1
ON CONFLICT (test_case_version_id) DO UPDATE SET
                                                 title = EXCLUDED.title,
                                                 description = EXCLUDED.description,
                                                 preconditions = EXCLUDED.preconditions,
                                                 expected_result = EXCLUDED.expected_result,
                                                 updated_at = NOW();

-- Steps for version 14
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions
    WHERE test_case_id = 14 AND version_number = 1
)
INSERT INTO test_case_version_steps (
    test_case_version_id, step_number, step_action, expected_result, execution, created_by
)
SELECT version_id.test_case_version_id, 1,
       'Navigate to product detail page for "Bosch ECU ME17.9.7"',
       'Product page displays with "Add to Cart" button',
       'MANUAL',
       1   -- created by admin
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 2,
       'Click "Add to Cart" button',
       'Button changes to "Added" or spinner appears',
       'MANUAL',
       1
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 3,
       'Observe cart icon in header',
       'Cart badge shows number 1 (or increments by 1)',
       'MANUAL',
       1
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 4,
       'Click cart icon to open cart drawer',
       'Drawer slides out and lists "Bosch ECU ME17.9.7" with quantity 1',
       'MANUAL',
       1
FROM version_id
ON CONFLICT (test_case_version_id, step_number) DO UPDATE SET
                                                              step_action = EXCLUDED.step_action,
                                                              expected_result = EXCLUDED.expected_result,
                                                              execution = EXCLUDED.execution,
                                                              updated_at = NOW();
-- Image for test case 14
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions
    WHERE test_case_id = 14 AND version_number = 1
)
INSERT INTO test_case_version_images (
    test_case_version_id, file_name, file_path, alt_text, position, created_by
)
SELECT
    version_id.test_case_version_id,
    'bosch_ecu_module.jpg',
    '/uploads/products/bosch_ecu_module.jpg',
    'Bosch ECU ME17.9.7 hardware module',
    1,
    1
FROM version_id
ON CONFLICT (test_case_version_id, file_name) DO UPDATE SET
                                                            file_path = EXCLUDED.file_path,
                                                            alt_text = EXCLUDED.alt_text,
                                                            position = EXCLUDED.position,
                                                            updated_at = NOW();

-- ----------------------------------------------------------------------
-- Test Case 1 – Version 2 (Enhanced with MFA)
-- ----------------------------------------------------------------------
WITH
    upsert_version AS (
        INSERT INTO test_case_versions (test_case_id, version_number, status, created_by)
            VALUES (1, 2, 'DRAFT', 1)
            ON CONFLICT (test_case_id, version_number) DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = NOW()
            RETURNING test_case_version_id
    ),
    version_id AS (
        SELECT test_case_version_id FROM upsert_version
        UNION ALL
        SELECT test_case_version_id FROM test_case_versions
        WHERE test_case_id = 1 AND version_number = 2
        LIMIT 1
    )
INSERT INTO test_case_version_content (
    test_case_version_id, title, description, preconditions, expected_result, created_by
)
SELECT
    (SELECT test_case_version_id FROM version_id),
    'ECU-1: Valid credentials login (Enhanced)',
    'Verify login with correct credentials, now including MFA step.',
    'User account exists with MFA enabled.',
    'User is redirected to dashboard after successful login and MFA verification.',
    1
ON CONFLICT (test_case_version_id) DO UPDATE SET
                                                 title = EXCLUDED.title,
                                                 description = EXCLUDED.description,
                                                 preconditions = EXCLUDED.preconditions,
                                                 expected_result = EXCLUDED.expected_result,
                                                 updated_at = NOW();

-- Steps for version 2
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions
    WHERE test_case_id = 1 AND version_number = 2
)
INSERT INTO test_case_version_steps (
    test_case_version_id, step_number, step_action, expected_result, execution, created_by
)
SELECT version_id.test_case_version_id, 1,
       'Navigate to login page',
       'Login page displayed',
       'MANUAL',
       1   -- created by admin
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 2,
       'Enter valid username and password',
       'Credentials accepted',
       'MANUAL',
       1
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 3,
       'Click Sign In',
       'MFA challenge page appears',
       'MANUAL',
       1
FROM version_id
UNION ALL
SELECT version_id.test_case_version_id, 4,
       'Enter valid TOTP code',
       'System verifies and redirects to dashboard',
       'AUTOMATED',
       1
FROM version_id
ON CONFLICT (test_case_version_id, step_number) DO UPDATE SET
                                                              step_action = EXCLUDED.step_action,
                                                              expected_result = EXCLUDED.expected_result,
                                                              execution = EXCLUDED.execution,
                                                              updated_at = NOW();
-- Image for MFA screen
WITH version_id AS (
    SELECT test_case_version_id FROM test_case_versions
    WHERE test_case_id = 1 AND version_number = 2
)
INSERT INTO test_case_version_images (
    test_case_version_id, file_name, file_path, alt_text, position, created_by
)
SELECT
    version_id.test_case_version_id,
    'ecu_mfa_prompt.png',
    '/uploads/testcases/ecu_mfa_prompt.png',
    'ECU MFA code entry screen',
    1,
    1
FROM version_id
ON CONFLICT (test_case_version_id, file_name) DO UPDATE SET
                                                            file_path = EXCLUDED.file_path,
                                                            alt_text = EXCLUDED.alt_text,
                                                            position = EXCLUDED.position,
                                                            updated_at = NOW();