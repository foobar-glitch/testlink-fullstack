package com.testlink.webapp.testmanagement.plan.repository;

import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestPlanStatsRepository extends JpaRepository<TestPlanStats, Long> {
    Optional<TestPlanStats> findTestPlanStatsByTestPlan(TestPlan testPlan);
}
