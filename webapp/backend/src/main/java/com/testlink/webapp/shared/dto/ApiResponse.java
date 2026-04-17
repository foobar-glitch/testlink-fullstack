package com.testlink.webapp.shared.dto;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ApiResponse<T>(
        String message,
        boolean success,
        T data,
        LocalDateTime timestamp
) {
    // Customized builder to auto‑set timestamp if omitted
    public static class ApiResponseBuilder<T> {
        private LocalDateTime timestamp = LocalDateTime.now(); // default

        public ApiResponseBuilder<T> timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

    }
}