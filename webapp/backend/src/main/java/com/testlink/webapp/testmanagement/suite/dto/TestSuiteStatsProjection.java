package com.testlink.webapp.testmanagement.suite.dto;

import com.testlink.webapp.testmanagement.plan.entity.TestRunStatus;

import java.time.LocalDateTime;

public interface TestSuiteStatsProjection {
    Long getTestSuiteId();
    Long getTotalTestCases();
    Long getTotalExecutions();
    TestRunStatus getLastExecutionStatus();   // raw string from DB
    LocalDateTime getLastExecutedAt();
    Long getPassedCount();
    Long getFailedCount();
    Long getBlockedCount();
    Long getNotRunCount();
}