package com.testlink.webapp.user.dto;

import com.testlink.webapp.shared.dto.TimeStampDTO;
import lombok.Builder;


@Builder
public record AuthorityDTO(
        String authorityId,
        String authority,
        TimeStampDTO timeStamp
) {}