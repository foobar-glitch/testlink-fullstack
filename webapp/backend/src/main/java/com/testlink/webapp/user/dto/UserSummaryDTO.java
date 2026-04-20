package com.testlink.webapp.user.dto;

import lombok.Builder;

@Builder
public record UserSummaryDTO(
        String userId,
        String username
) {}