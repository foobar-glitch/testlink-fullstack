package com.testlink.webapp.testmanagement.testcase.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.repository.TestSuiteRepository;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.entity.TestCasePlanStats;
import com.testlink.webapp.testmanagement.testcase.repository.TestCasePlanStatsRepository;
import com.testlink.webapp.testmanagement.testcase.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TestCaseService {
    private final TestCaseRepository testCaseRepository;
    private final TestCasePlanStatsRepository testCasePlanStatsRepository;
    private final TestSuiteRepository testSuiteRepository;

    public TestCase findById(Long testCaseId){
        return testCaseRepository.findById(testCaseId).orElseThrow(() -> new ResourceNotFoundException("Testcase", "testCaseId", testCaseId));
    }

    public List<TestCase> findAllTestCasesOfProjectAndSuite(Project project, TestSuite testSuite){
        return testCaseRepository.findAllByProjectAndTestSuite(project, testSuite);
    }

    public TestCase findByProjectAndIdentifierNumber(Project project, Long testCaseIdentifierNumber){
        return testCaseRepository.findByProjectAndIdentifierNumber(project, testCaseIdentifierNumber).orElseThrow(
                () -> new ResourceNotFoundException(
                        "TestCase", "projectKey-number",
                        String.format("%s-%s", project.getProjectKey(), testCaseIdentifierNumber)
                )
        );
    }

    public TestCasePlanStats findTestCaseStatsByTestCaseAndTestPlan(TestCase testCase, TestPlan testPlan){
        return testCasePlanStatsRepository.findTestCasePlanStatsByTestCaseAndTestPlan(testCase, testPlan).orElseThrow(
                () -> new ResourceNotFoundException(
                        "TestCaseStats", "TestCaseId", testCase.getPublicId()
                )
        );
    }

    public List<TestCase> findAllTestCasesOfSuiteRecursive(Project project, TestSuite suite) {
        Set<TestSuite> allSuites = new HashSet<>();
        collectDescendantSuites(suite, allSuites);
        allSuites.add(suite);
        return testCaseRepository.findByTestSuiteIn(allSuites);
    }

    private void collectDescendantSuites(TestSuite parent, Set<TestSuite> suites) {
        List<TestSuite> children = testSuiteRepository.findByParentTestSuite_TestSuiteId(parent.getTestSuiteId());
        for (TestSuite child : children) {
            suites.add(child);
            collectDescendantSuites(child, suites);
        }
    }
}
