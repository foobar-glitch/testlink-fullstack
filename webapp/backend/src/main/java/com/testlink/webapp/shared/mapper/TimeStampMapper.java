package com.testlink.webapp.shared.mapper;

import com.testlink.webapp.shared.dto.TimeStampDTO;
import com.testlink.webapp.shared.entity.TimeStampedEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TimeStampMapper {
    TimeStampDTO toDto(TimeStampedEntity entity);
}