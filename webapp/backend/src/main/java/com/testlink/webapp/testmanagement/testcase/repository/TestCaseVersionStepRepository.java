package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestCaseVersionStepRepository  extends JpaRepository<TestCaseVersionStep, Long> {
    List<TestCaseVersionStep> findAllByTestCaseVersion(TestCaseVersion testCaseVersion);

    @Query("""
        SELECT s FROM TestCaseVersionStep s
        JOIN s.testCaseVersion v
        JOIN v.testCase tc
        JOIN tc.testSuite ts
        JOIN ts.project p
        WHERE s.publicId = :stepId AND p = :project
    """)
    Optional<TestCaseVersionStep> findByPublicIdAndProject(@Param("stepId") UUID stepId,
                                                           @Param("project") Project project);

}
