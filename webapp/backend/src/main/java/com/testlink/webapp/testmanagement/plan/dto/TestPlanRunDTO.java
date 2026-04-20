package com.testlink.webapp.testmanagement.plan.dto;

import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import lombok.Builder;

@Builder
public record TestPlanRunDTO(
        String testPlanRunId,
        TestPlanDTO testPlan,
        String name,
        String environment,
        String build,
        UserCreatedTimeStampDTO stamp
) {
}
