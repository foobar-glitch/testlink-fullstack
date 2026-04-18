package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestCaseVersionRepository extends JpaRepository<TestCaseVersion, Long> {
    List<TestCaseVersion> findAllByTestCaseOrderByVersionNumberDesc(TestCase testCase);
    Optional<TestCaseVersion> findByTestCaseAndVersionNumber(TestCase testCase, Long versionNumber);
}