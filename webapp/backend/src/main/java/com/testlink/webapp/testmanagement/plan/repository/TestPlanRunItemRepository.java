package com.testlink.webapp.testmanagement.plan.repository;


import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestPlanRunItemRepository  extends JpaRepository<TestPlanRunItem, Long> {
    List<TestPlanRunItem> findAllByTestPlanRun(TestPlanRun testPlanRun);

    @Query("""
    SELECT i FROM TestPlanRunItem i
    JOIN i.testPlanRun r
    JOIN r.testPlan tp
    WHERE i.publicId = :itemId AND tp.project = :project
""")
    Optional<TestPlanRunItem> findByPublicIdAndProject(@Param("itemId") UUID itemId, @Param("project") Project project);

    List<TestPlanRunItem> findAllByTestCaseVersion(TestCaseVersion testCaseVersion);
}
