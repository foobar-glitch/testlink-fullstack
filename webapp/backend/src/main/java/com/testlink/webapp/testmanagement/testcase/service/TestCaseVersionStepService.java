package com.testlink.webapp.testmanagement.testcase.service;

import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import com.testlink.webapp.testmanagement.testcase.repository.TestCaseVersionStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestCaseVersionStepService {
    private final TestCaseVersionStepRepository testCaseVersionStepRepository;

    public List<TestCaseVersionStep> findTestCaseVersionStepsByTestCaseVersion(TestCaseVersion testCaseVersion){
        return testCaseVersionStepRepository.findAllByTestCaseVersion(testCaseVersion);
    }

    public TestCaseVersionStep findTestCaseVersionByPublicId(UUID stepId){
        return testCaseVersionStepRepository.findByPublicId(stepId).orElseThrow(
                () -> new ResourceNotFoundException("TestCaseVersionStepRepository", "stepId", stepId)
        );
    }
}
