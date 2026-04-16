package com.testlink.webapp.userAuthentication.dto;


public record AuthResponse(
        String message,
        UserTableDTO user
) {}