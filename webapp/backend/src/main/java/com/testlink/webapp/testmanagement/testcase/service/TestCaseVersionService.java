package com.testlink.webapp.testmanagement.testcase.service;

import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.repository.TestCaseVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestCaseVersionService {
    private final TestCaseVersionRepository testCaseVersionRepository;

    public List<TestCaseVersion> getVersionsForTestCase(TestCase testCase) {
        return testCaseVersionRepository.findAllByTestCaseOrderByVersionNumberDesc(testCase);
    }

    public TestCaseVersion findByTestCaseAndVersionNumber(TestCase testCase, Long versionNumber) {
        return testCaseVersionRepository.findByTestCaseAndVersionNumber(testCase, versionNumber)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("%s not found with version number %d", testCase.getTitle(), versionNumber)));
    }
}