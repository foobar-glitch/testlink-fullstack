package com.testlink.webapp.testmanagement.testcase.dto;

import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStatus;
import lombok.Builder;

@Builder
public record TestCaseVersionDTO (
        Long testCaseVersionId,
        TestCaseDTO testCase,
        Long versionNumber,
        TestCaseVersionStatus status,
        UserCreatedTimeStampDTO stamp
)
{}
