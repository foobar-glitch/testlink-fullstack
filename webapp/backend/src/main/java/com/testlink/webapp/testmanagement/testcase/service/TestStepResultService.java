package com.testlink.webapp.testmanagement.testcase.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import com.testlink.webapp.testmanagement.testcase.entity.TestStepResult;
import com.testlink.webapp.testmanagement.testcase.repository.TestStepResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestStepResultService {
    private final TestStepResultRepository testStepResultRepository;

    public List<TestStepResult> findTestCaseStepsByTestCaseVersion(TestCaseVersionStep testCaseVersionStep){
        return testStepResultRepository.findAllByTestCaseVersionStep(testCaseVersionStep);
    }

    public TestStepResult findTestStepResultsByPublicIdAndProject(UUID publicId, Project project){
        return  testStepResultRepository.findByPublicIdAndProject(publicId, project).orElseThrow(
                () -> new ResourceNotFoundException("TestStepResult", "testStepResultId", publicId)
        );
    }
}
