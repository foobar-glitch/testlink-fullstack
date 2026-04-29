package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.entity.TestCasePlanStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestCasePlanStatsRepository extends JpaRepository<TestCasePlanStats, Long> {
    Optional<TestCasePlanStats> findTestCasePlanStatsByTestCaseAndTestPlan(TestCase testCase, TestPlan testPlan);
}
