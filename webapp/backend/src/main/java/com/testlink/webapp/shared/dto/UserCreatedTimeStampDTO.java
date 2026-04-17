package com.testlink.webapp.shared.dto;

import com.testlink.webapp.user.dto.UserSummaryDTO;
import lombok.Builder;

@Builder
public record UserCreatedTimeStampDTO(
        UserSummaryDTO user, TimeStampDTO timeStamp
) {}