package com.testlink.webapp.user.mapper;

import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.user.dto.UserSummaryDTO;
import com.testlink.webapp.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {IdMapper.class}
)
public interface UserSummaryMapper {

    @Mapping(target = "userId", source = "publicId")
    UserSummaryDTO toSummary(User user);
}