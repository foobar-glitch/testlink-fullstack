package com.testlink.webapp.testmanagement.testcase.dto;

import com.testlink.webapp.testmanagement.plan.entity.TestRunStatus;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record TestCaseVersionPlanStatsDTO(
        String testCaseVersionId,
        String testPlanId,
        Integer totalExecutions,
        TestRunStatus lastExecutionStatus,
        LocalDateTime lastExecutedAt,
        Integer passedCount,
        Integer failedCount,
        Integer blockedCount,
        Integer notRunCount,
        //Integer avgExecutionTimeMs
        LocalDateTime startsUpdatedAtd
) {}
