package com.testlink.webapp.testmanagement.plan.dto;

import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import com.testlink.webapp.testmanagement.plan.entity.TestRunStatus;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseDTO;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionDTO;
import com.testlink.webapp.user.dto.UserSummaryDTO;

import java.time.LocalDateTime;

public record TestPlanRunItemDTO(
        Long testRunItemId,
        TestPlanRunDTO testRun,
        TestCaseDTO testCase,
        TestCaseVersionDTO testCaseVersion,
        UserSummaryDTO assignedTo,
        UserSummaryDTO executedBy,
        TestRunStatus status,
        LocalDateTime executedAt,
        String notes,
        UserCreatedTimeStampDTO stamp
) {
}
