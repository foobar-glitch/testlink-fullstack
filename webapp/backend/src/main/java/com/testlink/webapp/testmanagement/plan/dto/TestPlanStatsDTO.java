package com.testlink.webapp.testmanagement.plan.dto;

import com.testlink.webapp.testmanagement.plan.entity.TestRunStatus;

import java.time.LocalDateTime;

public record TestPlanStatsDTO(
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
) {
}
