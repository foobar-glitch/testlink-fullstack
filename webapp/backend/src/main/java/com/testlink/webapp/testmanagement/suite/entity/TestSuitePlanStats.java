package com.testlink.webapp.testmanagement.suite.entity;

import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.entity.TestRunStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_suite_plan_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestSuitePlanStats {

    @EmbeddedId
    private TestSuitePlanStatsId id;

    @MapsId("testSuiteId")
    @ManyToOne
    @JoinColumn(name = "test_suite_id", referencedColumnName = "public_uuid", insertable = false, updatable = false)
    private TestSuite testSuite;

    @MapsId("testPlanId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_plan_id", referencedColumnName = "public_uuid", insertable = false, updatable = false)
    private TestPlan testPlan;

    @Column(name = "total_child_suites", nullable = false)
    private Integer totalChildSuites = 0;

    @Column(name = "total_test_cases", nullable = false)
    private Integer totalTestCases = 0;

    @Column(name = "total_executions", nullable = false)
    private Integer totalExecutions = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_execution_status")
    private TestRunStatus lastExecutionStatus;

    @Column(name = "last_executed_at")
    private LocalDateTime lastExecutedAt;

    @Column(name = "passed_count", nullable = false)
    private Integer passedCount = 0;

    @Column(name = "failed_count", nullable = false)
    private Integer failedCount = 0;

    @Column(name = "blocked_count", nullable = false)
    private Integer blockedCount = 0;

    @Column(name = "not_run_count", nullable = false)
    private Integer notRunCount = 0;

    @Column(name = "stats_updated_at", nullable = false)
    private LocalDateTime statsUpdatedAt;
}