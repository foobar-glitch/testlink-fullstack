package com.testlink.webapp.testmanagement.plan.entity;


import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_plan_runs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestPlanRun extends UserCreatedTimeStampedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long testPlanRunId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_plan_id", nullable = false)
    private TestPlan testPlan;

    @Column(name = "name", nullable = false, length = 250)
    private String name;

    @Column(name = "environment", length = 100)
    private String environment;

    @Column(name = "build", length = 100)
    private String build;
}
