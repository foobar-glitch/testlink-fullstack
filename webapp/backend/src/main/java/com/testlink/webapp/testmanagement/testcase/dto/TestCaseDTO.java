package com.testlink.webapp.testmanagement.testcase.dto;

import com.testlink.webapp.projects.dto.ProjectDTO;
import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import com.testlink.webapp.testmanagement.suite.dto.TestSuiteItemDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseStatus;
import lombok.Builder;

@Builder
public record TestCaseDTO (
        String testCaseId,
        TestSuiteItemDTO testSuite,
        Long identifierNumber,
        String title,
        String description,
        TestCaseStatus status,
        UserCreatedTimeStampDTO stamp
)
{}
