package com.testlink.webapp.testmanagement.suite.dto;

import com.testlink.webapp.testmanagement.plan.entity.TestRunStatus;

import java.time.LocalDateTime;

public record TestSuiteStatsDTO(
        Integer totalChildSuites,
        Integer totalTestCases,
        Integer totalExecutions,
        TestRunStatus lastExecutionStatus,
        LocalDateTime lastExecutedAt,
        Integer passedCount,
        Integer failedCount,
        Integer blockedCount,
        Integer notRunCount,
        //Integer avgExecutionTimeMs
        LocalDateTime startsUpdatedAt
) {}
