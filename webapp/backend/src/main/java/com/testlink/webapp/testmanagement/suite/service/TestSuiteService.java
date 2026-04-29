package com.testlink.webapp.testmanagement.suite.service;


import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.entity.TestSuitePlanStats;
import com.testlink.webapp.testmanagement.suite.repository.TestSuiteRepository;
import com.testlink.webapp.testmanagement.suite.repository.TestSuiteStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestSuiteService {
    private final TestSuiteRepository testSuiteRepository;
    private final TestSuiteStatsRepository testSuiteStatsRepository;


    public List<TestSuite> findByProject(Project project){
        return testSuiteRepository.findByProject(project);
    }

    public List<TestSuite> findProjectTestSuiteRootTree(Project project){
        return testSuiteRepository.findByProjectAndParentTestSuiteIsNull(project);
    }

    public TestSuite findBySuiteId(UUID suiteId){
        return testSuiteRepository.findByPublicId(suiteId).orElseThrow(
                () -> new ResourceNotFoundException("TestSuite", "testSuiteId", suiteId)
        );
    }

    public List<TestSuite> findChildrenOfTestSuiteInProject(Project project, TestSuite testSuite){
        return testSuiteRepository.findByProjectAndParentTestSuite(project, testSuite);
    }

    public TestSuitePlanStats findTestSuiteStatsByTestSuite(TestSuite testSuite){
        return testSuiteStatsRepository.findTestSuiteStatsByTestSuite(testSuite).orElseThrow(
                () -> new ResourceNotFoundException("TestSuiteStats", "testSuite", testSuite.getPublicId())
        );
    }

    public TestSuitePlanStats findSuiteStatsByTestPlanAndSuite(TestPlan testPlan, TestSuite testSuite) {
        return testSuiteStatsRepository.findTestSuitePlanStatsByTestPlanAndTestSuite(testPlan, testSuite)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("TestStats of TestSuite %s in TestPlan %s not found",
                                testSuite.getPublicId(), testPlan.getPublicId())
                ));
    }

    // TestSuiteService.java
    public List<TestSuitePlanStats> findSuiteStatsByTestPlanAndSuites(
            TestPlan testPlan, List<TestSuite> testSuites) {
        return testSuiteStatsRepository.findAllByPlanAndSuites(testPlan, testSuites);
    }
}
