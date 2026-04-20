package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestCaseVersionStepRepository  extends JpaRepository<TestCaseVersionStep, Long> {
    List<TestCaseVersionStep> findAllByTestCaseVersion(TestCaseVersion testCaseVersion);
    Optional<TestCaseVersionStep> findByPublicId(UUID publicId);

}
