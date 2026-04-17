package com.testlink.webapp.user.dto;


public record AuthResponse(
        String message,
        UserDTO user
) {}