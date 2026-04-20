package com.testlink.webapp.user.mapper;

import com.testlink.webapp.user.dto.UserSummaryDTO;
import com.testlink.webapp.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserSummaryMapper {

    UserSummaryDTO toSummary(User user);
}