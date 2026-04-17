package com.testlink.webapp.user.dto;


public record AuthResponse(
        String message,
        UserTableDTO user
) {}