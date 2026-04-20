package com.testlink.webapp.user.dto;

import com.testlink.webapp.shared.dto.TimeStampDTO;

import java.util.Set;

public record UserDTO(
        String publicId,
        String username,
        String email,
        Set<AuthorityDTO> roles,
        TimeStampDTO timeStamp
) {}