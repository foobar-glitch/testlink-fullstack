package com.testlink.webapp.testmanagement.testcase.dto;

import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionPriority;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionPublishStatus;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStats;
import lombok.Builder;

@Builder
public record TestCaseVersionDTO (
        String testCaseVersionId,
        TestCaseDTO testCase,
        Long versionNumber,
        TestCaseVersionPublishStatus status,
        TestCaseVersionPriority priority,
        UserCreatedTimeStampDTO stamp
)
{}
