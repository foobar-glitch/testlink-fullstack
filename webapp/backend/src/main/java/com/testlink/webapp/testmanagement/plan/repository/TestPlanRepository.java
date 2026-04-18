package com.testlink.webapp.testmanagement.plan.repository;

import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestPlanRepository extends JpaRepository<TestPlan, Long> {

}
