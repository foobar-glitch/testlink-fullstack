package com.testlink.webapp.user.dto;

import java.util.Set;

public record UserDTO(
        Long userId,
        String username,
        String email,
        Set<String> roles
) {}