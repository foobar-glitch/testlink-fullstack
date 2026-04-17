package com.testlink.webapp.testmanagement.testcase.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestCaseService {
    private final TestCaseRepository testCaseRepository;

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
}
