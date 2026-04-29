package com.testlink.webapp.testmanagement.testcase.entity;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "test_cases", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"project_id", "identifier_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase extends UserCreatedTimeStampedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long testCaseId;

    @Column(name = "public_uuid", nullable = false)
    private UUID publicId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "test_suite_id", nullable = false)
    private TestSuite testSuite;

    @Column(name = "identifier_number", nullable = false)
    private Long identifierNumber;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TestCaseStatus status = TestCaseStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private TestCaseVersionPriority priority = TestCaseVersionPriority.MEDIUM;

    @Builder.Default
    @OneToMany(
            mappedBy = "testCase",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private Set<TestCaseVersion> versions = new HashSet<>();
}
