package com.testlink.webapp.user.dto;

import com.testlink.webapp.shared.dto.TimeStampDTO;

import java.util.Set;

public record UserDTO(
        Long userId,
        String username,
        String email,
        Set<String> roles,
        TimeStampDTO timeStamp
) {}