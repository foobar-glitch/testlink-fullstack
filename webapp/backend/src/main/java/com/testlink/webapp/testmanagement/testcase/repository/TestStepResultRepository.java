package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import com.testlink.webapp.testmanagement.testcase.entity.TestStepResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestStepResultRepository extends JpaRepository<TestStepResult, Long> {
    List<TestStepResult> findAllByTestCaseVersionStep(TestCaseVersionStep testCaseVersionStep);
    @Query("""
        SELECT r FROM TestStepResult r
        JOIN r.testRunItem tri
        JOIN tri.testPlanRun tpr
        JOIN tpr.testPlan tp
        JOIN tp.project p
        WHERE r.publicId = :resultId AND p = :project
    """)
    Optional<TestStepResult> findByPublicIdAndProject(@Param("resultId") UUID resultId,
                                                      @Param("project") Project project);
}
