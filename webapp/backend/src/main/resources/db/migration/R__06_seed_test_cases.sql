-- ======================================================================
-- R__06_seed_test_cases.sql
-- Populates test cases linked to suites and projects.
-- Assumes:
--   - projects: 1=E-Commerce, 2=Mobile App, 3=API Gateway
--   - test_suites: IDs 2 (Login Flow), 5 (Search), 9 (Cart Management)
--   - users: created_by = 1 (admin)
-- ======================================================================

-- Project 1 - Suite 2 (Login Flow) - Numbers 1..10
INSERT INTO test_cases (test_case_id, project_id, test_suite_id, number, title, description, status, created_by)
VALUES
    (1, 1, 2, 1, 'Valid credentials login', 'Verify user can log in with correct username and password.', 'ACTIVE', 1),
    (2, 1, 2, 2, 'Invalid password shows error', 'Verify error message appears for wrong password.', 'ACTIVE', 1),
    (3, 1, 2, 3, 'Empty fields validation', 'Verify form shows validation when fields are empty.', 'ACTIVE', 1),
    (4, 1, 2, 4, 'Remember me persists session', 'Verify session persists when remember me is checked.', 'ACTIVE', 1),
    (5, 1, 2, 5, 'Logout clears session', 'Verify logging out invalidates the session cookie.', 'ACTIVE', 1),
    (6, 1, 2, 6, 'Locked account handling', 'Verify appropriate message shown for locked accounts.', 'ACTIVE', 1),
    (7, 1, 2, 7, 'SQL injection prevention', 'Verify login is not vulnerable to basic SQL injection.', 'ACTIVE', 1),
    (8, 1, 2, 8, 'Forgot password link present', 'Verify forgot password link is visible on login page.', 'ACTIVE', 1),
    (9, 1, 2, 9, 'Redirect to originally requested URL', 'Verify user is redirected to original page after login.', 'ACTIVE', 1),
    (10, 1, 2, 10, 'HTTPS enforcement on login', 'Verify login page is only served over HTTPS.', 'DRAFT', 1)
ON CONFLICT (test_case_id) DO NOTHING;

-- Project 1 - Suite 5 (Search) - Numbers 11..13
INSERT INTO test_cases (test_case_id, project_id, test_suite_id, number, title, description, status, created_by)
VALUES
    (11, 1, 5, 11, 'Basic keyword search returns results', 'Verify search returns relevant products.', 'ACTIVE', 1),
    (12, 1, 5, 12, 'No results shows empty state', 'Verify empty state UI appears when no results found.', 'ACTIVE', 1),
    (13, 1, 5, 13, 'Search suggestions appear on type', 'Verify typeahead suggestions appear after 2 characters.', 'ACTIVE', 1)
ON CONFLICT (test_case_id) DO NOTHING;

-- Project 1 - Suite 9 (Cart Management) - Numbers 14..16
INSERT INTO test_cases (test_case_id, project_id, test_suite_id, number, title, description, status, created_by)
VALUES
    (14, 1, 9, 14, 'Add item to cart', 'Verify item is added and cart count updates.', 'ACTIVE', 1),
    (15, 1, 9, 15, 'Remove item from cart', 'Verify item removal updates total correctly.', 'ACTIVE', 1),
    (16, 1, 9, 16, 'Cart persists on page refresh', 'Verify cart contents are maintained after page reload.', 'ACTIVE', 1)
ON CONFLICT (test_case_id) DO NOTHING;

-- Additional test cases for Project 2 & 3 can be added here as needed

-- Reset sequence to avoid future conflicts
SELECT setval(pg_get_serial_sequence('test_cases', 'test_case_id'), (SELECT MAX(test_case_id) FROM test_cases));