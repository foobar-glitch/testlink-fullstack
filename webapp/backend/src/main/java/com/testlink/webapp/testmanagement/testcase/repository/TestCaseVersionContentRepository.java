package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestCaseVersionContentRepository extends JpaRepository<TestCaseVersionContent, Long> {
    Optional<TestCaseVersionContent> findTestCaseVersionContentByTestCaseVersion(TestCaseVersion testCaseVersion);
}
