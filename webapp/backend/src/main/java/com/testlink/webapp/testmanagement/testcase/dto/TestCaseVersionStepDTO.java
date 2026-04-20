package com.testlink.webapp.testmanagement.testcase.dto;

import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestExecution;
import lombok.Builder;

@Builder
public record TestCaseVersionStepDTO(
        String stepId,
        TestCaseVersionDTO testCaseVersion,
        Long stepNumber,
        String stepAction,
        String expectedResult,
        TestExecution execution,
        UserCreatedTimeStampDTO stamp
) {}
