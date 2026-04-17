package com.testlink.webapp.projects.dto;

import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.user.dto.UserDTO;
import lombok.Builder;

@Builder
public record ProjectMembershipDTO (
        UserDTO user,
        ProjectDTO project,
        ProjectRole role
)
{}
