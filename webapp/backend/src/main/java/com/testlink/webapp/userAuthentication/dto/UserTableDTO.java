package com.testlink.webapp.userAuthentication.dto;

import java.util.Set;

public record UserTableDTO(
        String username,
        String email,
        Set<String> roles
) {}