package com.testlink.webapp.testmanagement.testcase.entity;

import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "test_case_version_steps", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"test_case_version_id", "step_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseVersionStep extends UserCreatedTimeStampedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stepId;

    @Column(name = "public_uuid", nullable = false, unique = true)
    private UUID publicId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_case_version_id", nullable = false)
    private TestCaseVersion testCaseVersion;

    @Column(name = "step_number", nullable = false)
    private Long stepNumber;

    @Column(name = "step_action", nullable = false, columnDefinition = "TEXT")
    private String stepAction;

    @Column(name = "expected_result", nullable = false, columnDefinition = "TEXT")
    private String expectedResult;

    @Enumerated(EnumType.STRING)
    @Column(name = "execution")
    private TestExecution execution;

}
