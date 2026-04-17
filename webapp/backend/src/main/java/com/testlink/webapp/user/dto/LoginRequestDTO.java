package com.testlink.webapp.user.dto;

public record LoginRequestDTO(
        String username,
        String password
) {}