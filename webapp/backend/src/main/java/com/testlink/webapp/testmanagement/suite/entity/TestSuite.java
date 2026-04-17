package com.testlink.webapp.testmanagement.suite.entity;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_suites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestSuite extends UserCreatedTimeStampedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long testSuiteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private TestSuite parentTestSuite;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "description", length = 350)
    private String description;
}
