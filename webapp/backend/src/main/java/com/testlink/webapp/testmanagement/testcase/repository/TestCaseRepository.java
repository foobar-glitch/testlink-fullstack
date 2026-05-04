package com.testlink.webapp.testmanagement.testcase.repository;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findAllByProject(Project project);
    List<TestCase> findByTestSuiteIn(Set<TestSuite> suites);
    List<TestCase> findAllByProjectAndTestSuite(Project project, TestSuite testSuite);
    Optional<TestCase> findByProjectAndIdentifierNumber(Project project, Long identifierNumber);
}
