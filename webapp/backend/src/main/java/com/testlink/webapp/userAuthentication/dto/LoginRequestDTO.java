package com.testlink.webapp.userAuthentication.dto;

public record LoginRequestDTO(
        String username,
        String password
) {}