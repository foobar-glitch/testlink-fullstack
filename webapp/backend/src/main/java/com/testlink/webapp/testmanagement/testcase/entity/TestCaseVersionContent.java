package com.testlink.webapp.testmanagement.testcase.entity;

import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_case_version_content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseVersionContent extends UserCreatedTimeStampedEntity{

    @Id
    private Long testCaseVersionId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "test_case_version_id")
    private TestCaseVersion testCaseVersion;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "preconditions", columnDefinition = "TEXT")
    private String preconditions;

    @Column(name = "expected_result", columnDefinition = "TEXT")
    private String expectedResult;

}