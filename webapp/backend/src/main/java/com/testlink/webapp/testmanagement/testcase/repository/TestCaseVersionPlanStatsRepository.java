package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionPlanStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestCaseVersionPlanStatsRepository extends JpaRepository<TestCaseVersionPlanStats, Long> {
    Optional<TestCaseVersionPlanStats> findTestCaseVersionPlanStatsByTestCaseVersionAndTestPlan(TestCaseVersion testCaseVersion, TestPlan testPlan);
}