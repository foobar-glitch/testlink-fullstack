package com.testlink.webapp.user.dto;

import jakarta.validation.constraints.*;

public record RegisterUserDTO(

        @NotBlank
        String username,

        @Email
        @NotBlank
        String email,

        @NotBlank
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,

        @NotBlank
        String confirmPassword
) {}