package com.testlink.webapp.testmanagement.plan.entity;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestPlan extends UserCreatedTimeStampedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long testPlanId;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "name", nullable = false, length = 250)
    private String name;

    @Column(name = "description", length = 500)
    private String description;
}
