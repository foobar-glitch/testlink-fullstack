-- ======================================================================
-- R__08_seed_test_case_version_content.sql
-- Populates test_case_version_content for existing versions.
-- Assumes test_case_versions already seeded (IDs match those from R__07).
-- ======================================================================

-- Test Case 1 – Version 1
WITH version_id AS (
    SELECT test_case_version_id
    FROM test_case_versions
    WHERE test_case_id = 1 AND version_number = 1
)
INSERT INTO test_case_version_content (
    test_case_version_id, title, description, preconditions, expected_result, created_by
)
SELECT
    version_id.test_case_version_id,
    'ECU-1: Valid credentials login',
    'Verify that a user can log in with correct username and password.',
    'User account exists in the system with known credentials.',
    'User is redirected to the dashboard after successful login.',
    1
FROM version_id
ON CONFLICT (test_case_version_id) DO UPDATE SET
                                                 title = EXCLUDED.title,
                                                 description = EXCLUDED.description,
                                                 preconditions = EXCLUDED.preconditions,
                                                 expected_result = EXCLUDED.expected_result,
                                                 updated_at = NOW();

-- Test Case 11 – Version 1
WITH version_id AS (
    SELECT test_case_version_id
    FROM test_case_versions
    WHERE test_case_id = 11 AND version_number = 1
)
INSERT INTO test_case_version_content (
    test_case_version_id, title, description, preconditions, expected_result, created_by
)
SELECT
    version_id.test_case_version_id,
    'ECU-11: Basic keyword search returns ECU fault codes',
    'Verify that searching for a known fault code returns relevant ECU documentation.',
    'Test database contains ECU fault code "P0301" with associated articles.',
    'Search results page displays at least one article containing "P0301".',
    2
FROM version_id
ON CONFLICT (test_case_version_id) DO UPDATE SET
                                                 title = EXCLUDED.title,
                                                 description = EXCLUDED.description,
                                                 preconditions = EXCLUDED.preconditions,
                                                 expected_result = EXCLUDED.expected_result,
                                                 updated_at = NOW();

-- Test Case 14 – Version 1
WITH version_id AS (
    SELECT test_case_version_id
    FROM test_case_versions
    WHERE test_case_id = 14 AND version_number = 1
)
INSERT INTO test_case_version_content (
    test_case_version_id, title, description, preconditions, expected_result, created_by
)
SELECT
    version_id.test_case_version_id,
    'ECU-14: Add ECU hardware module to order cart',
    'Verify that an ECU hardware item can be added to the shopping cart and the cart badge updates.',
    'User is logged in and browsing ECU hardware catalog. Item "Bosch ECU ME17.9.7" is in stock.',
    'Cart badge increments by 1 and the item appears in the cart summary drawer.',
    1
FROM version_id
ON CONFLICT (test_case_version_id) DO UPDATE SET
                                                 title = EXCLUDED.title,
                                                 description = EXCLUDED.description,
                                                 preconditions = EXCLUDED.preconditions,
                                                 expected_result = EXCLUDED.expected_result,
                                                 updated_at = NOW();

-- Test Case 1 – Version 2
WITH version_id AS (
    SELECT test_case_version_id
    FROM test_case_versions
    WHERE test_case_id = 1 AND version_number = 2
)
INSERT INTO test_case_version_content (
    test_case_version_id, title, description, preconditions, expected_result, created_by
)
SELECT
    version_id.test_case_version_id,
    'ECU-1: Valid credentials login (Enhanced)',
    'Verify login with correct credentials, now including MFA step.',
    'User account exists with MFA enabled.',
    'User is redirected to dashboard after successful login and MFA verification.',
    1
FROM version_id
ON CONFLICT (test_case_version_id) DO UPDATE SET
                                                 title = EXCLUDED.title,
                                                 description = EXCLUDED.description,
                                                 preconditions = EXCLUDED.preconditions,
                                                 expected_result = EXCLUDED.expected_result,
                                                 updated_at = NOW();