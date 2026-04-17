package com.testlink.webapp.user.dto;

import java.util.Set;

public record UserTableDTO(
        Long userId,
        String username,
        String email,
        Set<String> roles
) {}