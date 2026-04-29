-- ======================================================================
-- R__09_seed_test_plans.sql
-- Populates test plans, runs, run items, and step results with sample data.
-- Assumes existing data: projects (1-4), users (1-3), test_cases (1-16),
-- and test_case_versions for each test case (version 1 must exist for all).
-- Also assumes test_case_version_steps exist for these versions.
-- ======================================================================

-- ----------------------------------------------------------------------
-- Test Plans
-- ----------------------------------------------------------------------
INSERT INTO test_plans (test_plan_id, project_id, name, description, created_by)
VALUES
    (1, 1, 'Sprint 12 – Regression', 'Full regression after Sprint 12 release', 1),
    (2, 1, 'Hotfix – Checkout Bug', 'Targeted testing after checkout hotfix', 2),
    (3, 1, 'Sprint 13 – Search Module', 'New search feature acceptance tests', 1)
    ON CONFLICT (test_plan_id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('test_plans', 'test_plan_id'), (SELECT MAX(test_plan_id) FROM test_plans));

-- ----------------------------------------------------------------------
-- Test Plan Runs
-- ----------------------------------------------------------------------
INSERT INTO test_plan_runs (test_plan_run_id, test_plan_id, name, environment, build, created_by)
VALUES
    (1, 1, 'Chrome – Staging', 'Staging', 'build-12.3.1', 1),
    (2, 1, 'Safari – Staging', 'Staging', 'build-12.3.1', 1),
    (3, 2, 'Chrome – Production Hotfix', 'Production', 'hotfix-4.2.0', 2),
    (4, 3, 'Firefox – Dev', 'Development', 'sprint-13-rc1', 1)
    ON CONFLICT (test_plan_run_id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('test_plan_runs', 'test_plan_run_id'), (SELECT MAX(test_plan_run_id) FROM test_plan_runs));

-- ----------------------------------------------------------------------
-- Test Run Items
-- ----------------------------------------------------------------------
WITH
    -- Map each test_case_id to its version 1 id
    version_map AS (
        SELECT
            tcv.test_case_id,
            tcv.test_case_version_id
        FROM test_case_versions tcv
        WHERE tcv.version_number = 1
    ),
    -- Define which test cases belong to which run
    run_item_mapping AS (
        -- Run 1: Login Flow cases 1-10
        SELECT 1 AS run_id, tc.test_case_id
        FROM generate_series(1,10) AS tc(test_case_id)
        UNION ALL
        -- Run 2: Login Flow cases 1-10 (Safari)
        SELECT 2, tc.test_case_id
        FROM generate_series(1,10) AS tc(test_case_id)
        UNION ALL
        -- Run 3: Cart cases 14-16 + login 1,2
        SELECT 3, 14 UNION ALL
        SELECT 3, 15 UNION ALL
        SELECT 3, 16 UNION ALL
        SELECT 3, 1  UNION ALL
        SELECT 3, 2
        UNION ALL
        -- Run 4: Search cases 11-13
        SELECT 4, 11 UNION ALL
        SELECT 4, 12 UNION ALL
        SELECT 4, 13
    ),
    -- Join with version_map to get the correct version_id for each test case
    run_item_with_version AS (
        SELECT
            rim.run_id,
            rim.test_case_id,
            vm.test_case_version_id AS version_id
        FROM run_item_mapping rim
                 JOIN version_map vm ON vm.test_case_id = rim.test_case_id
    ),
    -- Compute status, assigned_to, executed_by, notes
    with_status AS (
        SELECT
            run_id,
            test_case_id,
            version_id,
            CASE
                WHEN run_id = 1 AND test_case_id IN (1,2,3,4,6,8,9) THEN 'PASSED'
                WHEN run_id = 1 AND test_case_id = 5 THEN 'FAILED'
                WHEN run_id = 1 AND test_case_id = 7 THEN 'FAILED'
                WHEN run_id = 1 AND test_case_id = 10 THEN 'BLOCKED'
                WHEN run_id = 2 AND test_case_id IN (1,2,3,4,6,8,9) THEN 'PASSED'
                WHEN run_id = 2 AND test_case_id = 5 THEN 'FAILED'
                WHEN run_id = 2 AND test_case_id = 7 THEN 'PASSED'
                WHEN run_id = 2 AND test_case_id = 10 THEN 'BLOCKED'
                WHEN run_id = 3 AND test_case_id = 14 THEN 'PASSED'
                WHEN run_id = 3 AND test_case_id = 15 THEN 'FAILED'
                WHEN run_id = 3 AND test_case_id = 16 THEN 'PASSED'
                WHEN run_id = 3 AND test_case_id IN (1,2) THEN 'PASSED'
                WHEN run_id = 4 THEN 'NOT_RUN'
                ELSE 'NOT_RUN'
                END AS status,
            CASE
                WHEN run_id = 1 AND test_case_id IN (1,2,3,5,6,7,9) THEN 2  -- tester1
                WHEN run_id = 1 AND test_case_id IN (4,8,10) THEN 1         -- admin
                WHEN run_id = 2 AND test_case_id IN (1,2,3,5,6,7,9) THEN 2
                WHEN run_id = 2 AND test_case_id IN (4,8,10) THEN 1
                WHEN run_id = 3 AND test_case_id IN (14,15,16,1,2) THEN 2
                WHEN run_id = 4 THEN NULL
                ELSE NULL
                END AS assigned_to,
            CASE
                WHEN run_id = 1 AND test_case_id IN (1,2,3,4,6,8,9) THEN 2   -- tester1 executed
                WHEN run_id = 1 AND test_case_id = 5 THEN 2
                WHEN run_id = 1 AND test_case_id = 7 THEN 2
                WHEN run_id = 1 AND test_case_id = 10 THEN 1                 -- admin executed blocked
                WHEN run_id = 2 AND test_case_id IN (1,2,3,4,6,8,9) THEN 2
                WHEN run_id = 2 AND test_case_id = 5 THEN 2
                WHEN run_id = 2 AND test_case_id = 7 THEN 2
                WHEN run_id = 2 AND test_case_id = 10 THEN 1
                WHEN run_id = 3 AND test_case_id = 14 THEN 2
                WHEN run_id = 3 AND test_case_id = 15 THEN 2
                WHEN run_id = 3 AND test_case_id = 16 THEN 2
                WHEN run_id = 3 AND test_case_id IN (1,2) THEN 2
                ELSE NULL
                END AS executed_by,
            CASE
                WHEN run_id = 1 AND test_case_id = 5 THEN 'Cookie not cleared on logout in Safari'
                WHEN run_id = 1 AND test_case_id = 7 THEN 'Server returns 500 on injection attempt'
                WHEN run_id = 1 AND test_case_id = 10 THEN 'Needs DevOps to configure HTTPS redirect first'
                WHEN run_id = 2 AND test_case_id = 5 THEN 'Still failing in Safari'
                WHEN run_id = 3 AND test_case_id = 15 THEN 'Total does not update when currency is EUR'
                ELSE ''
                END AS notes
        FROM run_item_with_version
    )
INSERT INTO test_run_items (
    test_run_id,
    test_case_version_id,
    status,
    assigned_to,
    executed_by,
    executed_at,
    notes,
    created_by
)
SELECT
    run_id,
    version_id,
    status,
    assigned_to,
    executed_by,
    CASE
        WHEN status NOT IN ('NOT_RUN') THEN
            CASE
                WHEN run_id = 1 THEN '2024-04-02 10:00:00+00'::timestamptz + (test_case_id * interval '10 minutes')
                WHEN run_id = 2 THEN '2024-04-02 13:00:00+00'::timestamptz + (test_case_id * interval '8 minutes')
                WHEN run_id = 3 THEN '2024-04-05 11:00:00+00'::timestamptz + (test_case_id * interval '15 minutes')
                ELSE NULL
                END
        ELSE NULL
        END AS executed_at,
    notes,
    1  -- created_by (admin)
FROM with_status
    ON CONFLICT (test_run_id, test_case_version_id) DO UPDATE SET
    status = EXCLUDED.status,
                                                           assigned_to = EXCLUDED.assigned_to,
                                                           executed_by = EXCLUDED.executed_by,
                                                           executed_at = EXCLUDED.executed_at,
                                                           notes = EXCLUDED.notes,
                                                           updated_at = NOW();

SELECT setval(pg_get_serial_sequence('test_run_items', 'test_run_item_id'), (SELECT MAX(test_run_item_id) FROM test_run_items));

-- ----------------------------------------------------------------------
-- Test Step Results (optional, but adds realistic detail)
-- ----------------------------------------------------------------------
WITH
    run_items_with_steps AS (
        SELECT
            tri.test_run_item_id,
            tri.test_run_id,
            tri.test_case_version_id,
            tri.status AS item_status,
            tvs.step_id,
            tvs.step_number,
            tvs.expected_result
        FROM test_run_items tri
                 JOIN test_case_version_steps tvs ON tri.test_case_version_id = tvs.test_case_version_id
        WHERE tri.status != 'NOT_RUN'   -- only insert steps for executed items
    ),
    step_results_data AS (
SELECT
    test_run_item_id,
    step_id,
    CASE
    WHEN item_status = 'PASSED' THEN 'PASSED'
    WHEN item_status = 'FAILED' AND step_number = (
    SELECT MAX(step_number) FROM test_case_version_steps WHERE test_case_version_id = ris.test_case_version_id
    ) THEN 'FAILED'   -- only last step fails
    ELSE 'PASSED'
    END AS step_status,
    CASE
    WHEN item_status = 'FAILED' AND step_number = (
    SELECT MAX(step_number) FROM test_case_version_steps WHERE test_case_version_id = ris.test_case_version_id
    ) THEN 'Actual result did not match expected: ' || expected_result
    ELSE NULL
    END AS actual_result,
    CASE
    WHEN item_status = 'FAILED' AND step_number = (
    SELECT MAX(step_number) FROM test_case_version_steps WHERE test_case_version_id = ris.test_case_version_id
    ) THEN 'Step failed, see actual result'
    ELSE NULL
    END AS notes,
    CASE
    WHEN item_status IN ('PASSED','FAILED') THEN
    (SELECT executed_at FROM test_run_items WHERE test_run_item_id = ris.test_run_item_id) +
    (step_number * interval '5 seconds')
    ELSE NULL
    END AS executed_at
FROM run_items_with_steps ris
    )
INSERT INTO test_step_results (
    test_run_item_id,
    test_case_version_step_id,
    status,
    actual_result,
    notes,
    executed_at,
    created_at,
    updated_at,
    created_by
)
SELECT
    test_run_item_id,
    step_id,
    step_status,
    actual_result,
    notes,
    executed_at,
    NOW(),
    NOW(),
    1
FROM step_results_data
    ON CONFLICT (test_run_item_id, test_case_version_step_id) DO NOTHING;