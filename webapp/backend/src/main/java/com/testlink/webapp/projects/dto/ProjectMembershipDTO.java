package com.testlink.webapp.projects.dto;

import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.user.dto.UserDTO;
import com.testlink.webapp.user.dto.UserSummaryDTO;
import lombok.Builder;

@Builder
public record ProjectMembershipDTO (
        UserSummaryDTO user,
        ProjectDTO project,
        ProjectRole role
)
{}
