package com.testlink.webapp.testmanagement.suite.repository;

import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.entity.TestSuitePlanStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestSuiteStatsRepository extends JpaRepository<TestSuitePlanStats, Long> {

    Optional<TestSuitePlanStats> findTestSuiteStatsByTestSuite(TestSuite testSuite);
    Optional<TestSuitePlanStats> findTestSuitePlanStatsByTestPlanAndTestSuite(TestPlan testPlan, TestSuite testSuite);

    @Query("""
        SELECT tsps FROM TestSuitePlanStats tsps
        WHERE tsps.id.testPlanId = :#{#plan.testPlanId}
          AND tsps.id.testSuiteId IN :#{#suites.![testSuiteId]}
    """)
    List<TestSuitePlanStats> findAllByPlanAndSuites(
            @Param("plan") TestPlan plan,
            @Param("suites") List<TestSuite> suites);

}