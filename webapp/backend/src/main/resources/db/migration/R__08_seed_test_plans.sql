-- ======================================================================
-- R__08_seed_test_plans.sql
-- Populates test plans, runs, and run cases with sample data.
-- Assumes existing data: projects (1-4), users (1-3), test_cases (1-16),
-- and test_case_versions (test_case_id 1,11,14 have versions).
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
-- Test Plan Run Cases
-- ----------------------------------------------------------------------
WITH
    v1 AS (SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 1 AND version_number = 1),
    v11 AS (SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 11 AND version_number = 1),
    v14 AS (SELECT test_case_version_id FROM test_case_versions WHERE test_case_id = 14 AND version_number = 1),
    -- Define which test cases belong to which run along with their version IDs
    run_case_mapping AS (
        -- Run 1: Login Flow cases 1-10
        SELECT 1 AS run_id, tc.test_case_id, (SELECT test_case_version_id FROM v1) AS version_id
        FROM generate_series(1,10) AS tc(test_case_id)
        UNION ALL
        -- Run 2: Login Flow cases 1-10 (Safari)
        SELECT 2, tc.test_case_id, (SELECT test_case_version_id FROM v1)
        FROM generate_series(1,10) AS tc(test_case_id)
        UNION ALL
        -- Run 3: Cart cases 14-16 + a couple login
        SELECT 3, 14, (SELECT test_case_version_id FROM v14) UNION ALL
        SELECT 3, 15, (SELECT test_case_version_id FROM v14) UNION ALL
        SELECT 3, 16, (SELECT test_case_version_id FROM v14) UNION ALL
        SELECT 3, 1, (SELECT test_case_version_id FROM v1) UNION ALL
        SELECT 3, 2, (SELECT test_case_version_id FROM v1)
        UNION ALL
        -- Run 4: Search cases 11-13
        SELECT 4, 11, (SELECT test_case_version_id FROM v11) UNION ALL
        SELECT 4, 12, (SELECT test_case_version_id FROM v11) UNION ALL
        SELECT 4, 13, (SELECT test_case_version_id FROM v11)
    ),
    -- Compute status based on run_id and test_case_id (mirroring original mock data)
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
                WHEN run_id = 1 AND test_case_id = 5 THEN 'Cookie not cleared on logout in Safari'
                WHEN run_id = 1 AND test_case_id = 7 THEN 'Server returns 500 on injection attempt'
                WHEN run_id = 1 AND test_case_id = 10 THEN 'Needs DevOps to configure HTTPS redirect first'
                WHEN run_id = 2 AND test_case_id = 5 THEN 'Still failing in Safari'
                WHEN run_id = 3 AND test_case_id = 15 THEN 'Total does not update when currency is EUR'
                ELSE ''
                END AS notes
        FROM run_case_mapping
    )
INSERT INTO test_plan_run_cases (
    test_plan_run_id, test_case_id, test_case_version_id,
    status, assigned_to, executed_at, notes, created_by
)
SELECT
    run_id,
    test_case_id,
    version_id,
    status,
    assigned_to,
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
ON CONFLICT (test_plan_run_id, test_case_id) DO UPDATE SET
                                                           status = EXCLUDED.status,
                                                           assigned_to = EXCLUDED.assigned_to,
                                                           executed_at = EXCLUDED.executed_at,
                                                           notes = EXCLUDED.notes,
                                                           updated_at = NOW();

SELECT setval(pg_get_serial_sequence('test_plan_run_cases', 'test_plan_run_case_id'), (SELECT MAX(test_plan_run_case_id) FROM test_plan_run_cases));