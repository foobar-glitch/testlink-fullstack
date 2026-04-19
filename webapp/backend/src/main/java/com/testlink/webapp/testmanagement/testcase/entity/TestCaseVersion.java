package com.testlink.webapp.testmanagement.testcase.entity;


import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_case_versions", uniqueConstraints = {
@UniqueConstraint(columnNames = {"test_case_id", "version_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseVersion extends UserCreatedTimeStampedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long testCaseVersionId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;

    @Column(name = "version_number", nullable = false)
    private Long versionNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TestCaseVersionStatus status = TestCaseVersionStatus.DRAFT;

}
