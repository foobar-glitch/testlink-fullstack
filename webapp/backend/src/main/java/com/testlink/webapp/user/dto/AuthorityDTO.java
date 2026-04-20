package com.testlink.webapp.user.dto;

import com.testlink.webapp.shared.dto.TimeStampDTO;
import lombok.Builder;

@Builder
public record AuthorityDTO(
        Long authorityId,
        String authority,
        TimeStampDTO timeStamp
) {}