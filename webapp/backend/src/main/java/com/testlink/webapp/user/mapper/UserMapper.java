package com.testlink.webapp.user.mapper;

import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.shared.mapper.TimeStampMapper;
import com.testlink.webapp.shared.util.IdUtil;
import com.testlink.webapp.user.dto.UserDTO;
import com.testlink.webapp.user.entity.Authority;
import com.testlink.webapp.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;



@Mapper(
        componentModel = "spring",
        uses = {AuthorityMapper.class, TimeStampMapper.class, IdMapper.class},
        implementationName = "AuthUserMapperImpl"
)
public interface UserMapper {

    // Removing 'source = "publicId"' and letting MapStruct find the method
    // Or being explicit like this:
    @Mapping(target = "userId", source = "publicId")
    @Mapping(target = "authorities", source = "authorities")
    @Mapping(target = "timeStamp", source = ".")
    UserDTO toDto(User user);
}