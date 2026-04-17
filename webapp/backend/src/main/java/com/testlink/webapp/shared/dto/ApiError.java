package com.testlink.webapp.shared.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ApiError(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp
) {}