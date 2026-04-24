package com.testlink.webapp.testmanagement.plan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_plan_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestPlanStats {
    @Id
    private Long testPlanId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "test_plan_id")
    private TestPlan testPlan;

    @Column(name = "total_test_cases", nullable = false)
    private Integer totalTestCases = 0;

    @Column(name = "total_executions",nullable = false)
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

    //@Column(name = "avg_execution_time_ms")
    //private Long avgExecutionTimeMs;

    @Column(name = "stats_updated_at", nullable = false)
    private LocalDateTime startsUpdatedAt;
}
