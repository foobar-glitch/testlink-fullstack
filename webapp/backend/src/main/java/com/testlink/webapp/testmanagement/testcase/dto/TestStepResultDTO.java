package com.testlink.webapp.testmanagement.testcase.dto;

import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunItemDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseStepStatus;

public record TestStepResultDTO (
    String testStepResultId,
    TestPlanRunItemDTO testRunItem,
    TestCaseVersionStepDTO testCaseVersionStep,
    TestCaseStepStatus status,
    String actualResult,
    String notes,
    UserCreatedTimeStampDTO stamp
)
{}
