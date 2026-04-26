package com.testlink.webapp.testmanagement.plan.repository;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestPlanRunRepository extends JpaRepository<TestPlanRun, Long> {
    List<TestPlanRun> findAllByTestPlan(TestPlan testPlan);

    @Query("""
        SELECT r FROM TestPlanRun r
        JOIN r.testPlan tp
        WHERE r.publicId = :runId AND tp.project = :project
    """)
    Optional<TestPlanRun> findByPublicIdAndProject(@Param("runId") UUID runId,
                                                   @Param("project") Project project);

    @Query("""
    SELECT r FROM TestPlanRun r
    JOIN r.testPlan tp
    WHERE r.publicId = :runId
      AND tp.publicId = :testPlanId
      AND tp.project = :project
""")
    Optional<TestPlanRun> findByPublicIdAndTestPlanIdAndProject(
            @Param("runId") UUID runId,
            @Param("testPlanId") UUID testPlanId,
            @Param("project") Project project
    );
}
