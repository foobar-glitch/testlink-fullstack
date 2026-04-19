package com.testlink.webapp.testmanagement.testcase.service;

import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionContent;
import com.testlink.webapp.testmanagement.testcase.repository.TestCaseVersionContentRepository;
import com.testlink.webapp.testmanagement.testcase.repository.TestCaseVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestCaseVersionContentService {
    private final TestCaseVersionContentRepository testCaseVersionContentRepository;

    public TestCaseVersionContent findContentOfTestCaseVersion(TestCaseVersion testCaseVersion){
        return testCaseVersionContentRepository.getTestCaseVersionContentByTestCaseVersion(testCaseVersion).orElseThrow(
                () -> new ResourceNotFoundException("TestCaseContent", "testCaseVersionNumber", testCaseVersion.getVersionNumber())
        );
    }
}
