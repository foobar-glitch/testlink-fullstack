package com.testlink.webapp.testmanagement.suite.repository;

import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.suite.dto.TestSuiteStatsProjection;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.entity.TestSuiteStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestSuiteStatsRepository extends JpaRepository<TestSuiteStats, Long> {

    Optional<TestSuiteStats> findTestSuiteStatsByTestSuite(TestSuite testSuite);

    @Query("""
    SELECT
        ts.testSuiteId AS testSuiteId,
        COUNT(DISTINCT tc.testCaseId) AS totalTestCases,
        COUNT(tri) AS totalExecutions,
        CAST(MAX(tri.status) AS string) AS lastExecutionStatus,
        MAX(tri.executedAt) AS lastExecutedAt,
        SUM(CASE WHEN tri.status = 'PASSED' THEN 1 ELSE 0 END) AS passedCount,
        SUM(CASE WHEN tri.status = 'FAILED' THEN 1 ELSE 0 END) AS failedCount,
        SUM(CASE WHEN tri.status = 'BLOCKED' THEN 1 ELSE 0 END) AS blockedCount,
        SUM(CASE WHEN tri.status = 'NOT_RUN' THEN 1 ELSE 0 END) AS notRunCount
    FROM TestSuite ts
    JOIN ts.testCases tc
    JOIN tc.versions tcv
    JOIN TestPlanRunItem tri ON tri.testCaseVersion = tcv
    JOIN tri.testPlanRun tpr
    WHERE tpr.testPlan = :plan
      AND ts = :testSuite
    GROUP BY ts.testSuiteId
""")
    Optional<TestSuiteStatsProjection> findSuiteStatsByTestPlanAndSuite(
            @Param("plan") TestPlan plan,
            @Param("testSuite") TestSuite testSuite
    );


    // TestSuiteStatsRepository.java
    @Query("""
    SELECT
        ts.testSuiteId AS testSuiteId,
        COUNT(DISTINCT tc.testCaseId) AS totalTestCases,
        COUNT(tri) AS totalExecutions,
        CAST(MAX(tri.status) AS string) AS lastExecutionStatus,
        MAX(tri.executedAt) AS lastExecutedAt,
        SUM(CASE WHEN tri.status = 'PASSED' THEN 1 ELSE 0 END) AS passedCount,
        SUM(CASE WHEN tri.status = 'FAILED' THEN 1 ELSE 0 END) AS failedCount,
        SUM(CASE WHEN tri.status = 'BLOCKED' THEN 1 ELSE 0 END) AS blockedCount,
        SUM(CASE WHEN tri.status = 'NOT_RUN' THEN 1 ELSE 0 END) AS notRunCount
    FROM TestSuite ts
    JOIN ts.testCases tc
    JOIN tc.versions tcv
    JOIN TestPlanRunItem tri ON tri.testCaseVersion = tcv
    JOIN tri.testPlanRun tpr
    WHERE tpr.testPlan = :plan
      AND ts IN :testSuites
    GROUP BY ts.testSuiteId
""")
    List<TestSuiteStatsProjection> findSuiteStatsByTestPlanAndSuitesProjection(
            @Param("plan") TestPlan plan,
            @Param("testSuites") List<TestSuite> testSuites
    );
}