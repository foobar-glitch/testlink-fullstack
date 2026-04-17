package com.testlink.webapp.testmanagement.testcase.entity;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import jakarta.persistence.*;
import lombok.*;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_suite_id")
    private TestSuite testSuite;

    @Column(name = "identifier_number", nullable = false)
    private Long identifierNumber;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TestCaseStatus status = TestCaseStatus.ACTIVE;

}
