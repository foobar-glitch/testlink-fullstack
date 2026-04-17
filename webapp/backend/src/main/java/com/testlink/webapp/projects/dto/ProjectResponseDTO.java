package com.testlink.webapp.projects.dto;

import com.testlink.webapp.projects.entity.ProjectStatus;
import java.time.LocalDateTime;

import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import lombok.Builder;


@Builder
public record ProjectResponseDTO(
        Long projectId,
        String projectKey,
        String displayName,
        String description,
        ProjectStatus status,
        UserCreatedTimeStampDTO stamp
) {}