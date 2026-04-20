package com.testlink.webapp.user.dto;

import com.testlink.webapp.shared.dto.TimeStampDTO;

import java.util.Set;

public record UserDTO(
        String userId,
        String username,
        String email,
        Set<AuthorityDTO> authorities,
        TimeStampDTO timeStamp
) {}