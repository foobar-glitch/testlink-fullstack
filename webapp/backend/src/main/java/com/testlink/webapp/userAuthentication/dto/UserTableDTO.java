package com.testlink.webapp.userAuthentication.dto;

import java.util.Set;

public record UserTableDTO(
        Long userId,
        String username,
        String email,
        Set<String> roles
) {}