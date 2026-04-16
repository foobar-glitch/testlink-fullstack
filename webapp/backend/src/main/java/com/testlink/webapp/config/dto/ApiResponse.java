package com.testlink.webapp.config.dto;

import java.time.LocalDateTime;
public record ApiResponse<T>(
        String message,
        boolean success,
        T data,
        LocalDateTime timestamp
) {
    // Secondary constructor
    public ApiResponse(String message, boolean success, T data) {
        this(message, success, data, LocalDateTime.now());
    }
}