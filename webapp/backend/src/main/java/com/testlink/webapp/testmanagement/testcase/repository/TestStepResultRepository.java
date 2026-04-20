package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import com.testlink.webapp.testmanagement.testcase.entity.TestStepResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestStepResultRepository extends JpaRepository<TestStepResult, Long> {
    List<TestStepResult> findAllByTestCaseVersionStep(TestCaseVersionStep testCaseVersionStep);
    Optional<TestStepResult> findByPublicId(UUID publicId);
}
