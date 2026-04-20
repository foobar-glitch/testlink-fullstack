package com.testlink.webapp.testmanagement.testcase.entity;

import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "test_step_results", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"test_run_item_id", "test_case_version_step_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestStepResult extends UserCreatedTimeStampedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long testStepResultId;

    @Column(name = "public_uuid", nullable = false, unique = true)
    private UUID publicId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_run_item_id", nullable = false)
    private TestPlanRunItem testRunItem;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_case_version_step_id", nullable = false)
    private TestCaseVersionStep testCaseVersionStep;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TestCaseStepStatus status = TestCaseStepStatus.NOT_RUN;

    @Column(name = "actual_result", columnDefinition = "TEXT")
    private String actualResult;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

}
