package com.testlink.webapp.testmanagement.plan.dto;

import com.testlink.webapp.projects.dto.ProjectDTO;
import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import lombok.Builder;

@Builder
public record TestPlanDTO(
        String testPlanId,
        ProjectDTO project,
        String name,
        String description,
        UserCreatedTimeStampDTO stamp
) {
}
