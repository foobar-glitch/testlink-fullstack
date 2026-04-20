package com.testlink.webapp.testmanagement.testcase.dto;

import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import lombok.Builder;

@Builder
public record TestCaseVersionContentDTO(
        String testCaseVersionId,
        TestCaseVersionDTO testCaseVersion,
        String title,
        String preconditions,
        String expectedResult,
        UserCreatedTimeStampDTO stamp
) {}
