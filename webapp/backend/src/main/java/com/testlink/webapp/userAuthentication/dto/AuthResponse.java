package com.testlink.webapp.userAuthentication.dto;

import java.util.Set;

public record AuthResponse(
        String message,
        String username,
        Set<String> roles
) {}