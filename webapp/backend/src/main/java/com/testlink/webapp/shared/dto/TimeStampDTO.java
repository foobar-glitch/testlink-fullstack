package com.testlink.webapp.shared.dto;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record TimeStampDTO(
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
