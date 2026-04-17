package com.testlink.webapp.user.dto;

import lombok.Builder;

@Builder
public record UserSummaryDTO(
        Long userId,
        String username
) {}