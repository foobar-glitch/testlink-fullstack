package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TestCaseVersionContentRepository extends JpaRepository<TestCaseVersionContent, Long> {
    Optional<TestCaseVersionContent> getTestCaseVersionContentByTestCaseVersion(TestCaseVersion testCaseVersion);
}
