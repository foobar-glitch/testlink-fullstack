package com.testlink.webapp.testmanagement.plan.repository;


import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
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

    @Query("""
    SELECT i FROM TestPlanRunItem i
    JOIN i.testPlanRun r
    JOIN r.testPlan tp
    WHERE i.testCaseVersion = :version
      AND tp.publicId = :planId
""")
    List<TestPlanRunItem> findAllByTestCaseVersionAndTestPlanPublicId(
            @Param("version") TestCaseVersion version,
            @Param("planId") UUID planId
    );

    @Query("""
    SELECT DISTINCT tc FROM TestPlanRunItem tri
    JOIN tri.testPlanRun run
    JOIN run.testPlan plan
    JOIN tri.testCaseVersion cv
    JOIN cv.testCase tc
    JOIN FETCH tc.testSuite
    WHERE plan.publicId = :planId
""")
    List<TestCase> findAllTestCasesByPlanId(@Param("planId") UUID planId);



}
