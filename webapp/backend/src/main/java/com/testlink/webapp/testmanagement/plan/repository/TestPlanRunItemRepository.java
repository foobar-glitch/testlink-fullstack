package com.testlink.webapp.testmanagement.plan.repository;


import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestPlanRunItemRepository  extends JpaRepository<TestPlanRunItem, Long> {
    List<TestPlanRunItem> findAllByTestPlanRun(TestPlanRun testPlanRun);

    Optional<TestPlanRunItem> findTestPlanRunItemsByPublicId(UUID publicId);
}
