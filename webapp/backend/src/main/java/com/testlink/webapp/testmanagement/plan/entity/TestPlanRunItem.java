package com.testlink.webapp.testmanagement.plan.entity;


import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "test_run_items",  uniqueConstraints = {
        @UniqueConstraint(columnNames = {"test_run_id", "test_case_version_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestPlanRunItem extends UserCreatedTimeStampedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long testRunItemId;

    @Column(name = "public_uuid", nullable = false)
    private UUID publicId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_run_id", nullable = false)
    private TestPlanRun testPlanRun;


    @ManyToOne(optional = false)
    @JoinColumn(name = "test_case_version_id", nullable = false)
    private TestCaseVersion testCaseVersion;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @ManyToOne
    @JoinColumn(name = "executed_by")
    private User executedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TestRunStatus status = TestRunStatus.NOT_RUN;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
