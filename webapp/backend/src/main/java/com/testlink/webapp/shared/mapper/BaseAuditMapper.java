package com.testlink.webapp.shared.mapper;


import com.testlink.webapp.shared.dto.TimeStampDTO;
import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import com.testlink.webapp.shared.entity.UserCreatedTimeStampedEntity;
import com.testlink.webapp.user.dto.UserSummaryDTO;
import com.testlink.webapp.user.entity.UserTable;
import com.testlink.webapp.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public abstract class BaseAuditMapper {

    @Autowired
    protected UserMapper userMapper;

    protected UserCreatedTimeStampDTO mapAudit(UserCreatedTimeStampedEntity entity) {
        UserTable createdBy = entity.getCreatedBy();
        UserSummaryDTO userSummary = createdBy != null
                ? UserSummaryDTO.builder()
                  .userId(createdBy.getUserId())
                  .username(createdBy.getUsername())
                  .build()
                : null;

        TimeStampDTO timeStamp = TimeStampDTO.builder()
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();

        return UserCreatedTimeStampDTO.builder()
                .user(userSummary)
                .timeStamp(timeStamp)
                .build();
    }
}