package com.testlink.webapp.projects.entity;

import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTable extends UserCreatedTimeStampedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;

    @Column(name = "project_key", nullable = false, length = 20, unique = true)
    private String projectKey;

    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "status", nullable = false, length = 20)
    private ProjectStatus status = ProjectStatus.ACTIVE;

}
