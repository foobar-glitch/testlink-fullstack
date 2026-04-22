package com.testlink.webapp.testmanagement.suite.service;


import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.entity.TestSuiteStats;
import com.testlink.webapp.testmanagement.suite.repository.TestSuiteRepository;
import com.testlink.webapp.testmanagement.suite.repository.TestSuiteStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
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

    public TestSuiteStats findTestSuiteStatsByTestSuite(TestSuite testSuite){
        return testSuiteStatsRepository.findTestSuiteStatsByTestSuite(testSuite).orElseThrow(
                () -> new ResourceNotFoundException("TestSuiteStats", "testSuite", testSuite.getPublicId())
        );
    }
}
