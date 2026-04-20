package com.testlink.webapp.shared.mapper;


import com.testlink.webapp.shared.dto.TimeStampDTO;
import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import com.testlink.webapp.user.dto.UserSummaryDTO;
import com.testlink.webapp.user.entity.User;
import com.testlink.webapp.user.mapper.UserMapper;
import com.testlink.webapp.user.mapper.UserSummaryMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {UserSummaryMapper.class, TimeStampMapper.class}
)
public abstract class BaseAuditMapper {

    @Mapping(target = "createdBy", source = "createdBy")
    @Mapping(target = "timeStamp", source = ".")
    public abstract UserCreatedTimeStampDTO mapAudit(UserCreatedTimeStampedEntity entity);
}