package com.testlink.webapp.shared.dto;

import com.testlink.webapp.user.dto.UserTableDTO;

import lombok.Builder;

@Builder
public record UserCreatedTimeStampDTO(
        UserTableDTO user, TimeStampDTO timeStamp
) {}