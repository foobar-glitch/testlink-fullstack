package com.testlink.webapp.userAuthentication.dto;


import java.util.Set;

public record UserTablesAdminDTO(
        Long userId,
        String username,
        String email,
        Set<String> roles
) {}