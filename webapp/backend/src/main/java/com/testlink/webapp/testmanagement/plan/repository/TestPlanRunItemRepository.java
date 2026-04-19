package com.testlink.webapp.testmanagement.plan.repository;


import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestPlanRunItemRepository  extends JpaRepository<TestPlanRunItem, Long> {

}
