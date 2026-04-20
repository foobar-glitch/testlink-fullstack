package com.testlink.webapp.testmanagement.suite.dto;

import com.testlink.webapp.projects.dto.ProjectDTO;
import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import lombok.Builder;

@Builder
public record TestSuiteItemDTO(
        String testSuiteId,
        String name,
        String description,
        ProjectDTO project,
        UserCreatedTimeStampDTO stamp
)
{}
