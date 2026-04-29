package com.testlink.webapp.testmanagement.testcase.dto;

import com.testlink.webapp.testmanagement.plan.entity.TestRunStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record TestCasePlanStatsDTO(
        String testCaseId,
        String testPlanId,
        Integer totalVersions,
        Integer totalExecutions,
        TestRunStatus lastExecutionStatus,
        LocalDateTime lastExecutedAt,
        Integer passedCount,
        Integer failedCount,
        Integer blockedCount,
        Integer notRunCount,
        LocalDateTime statsUpdatedAt
) {}