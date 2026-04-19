package com.testlink.webapp.testmanagement.plan.repository;

import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestPlanRunRepository extends JpaRepository<TestPlanRun, Long> {
    List<TestPlanRun> findAllByTestPlan(TestPlan testPlan);
}
