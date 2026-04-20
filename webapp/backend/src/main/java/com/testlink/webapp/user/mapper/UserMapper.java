package com.testlink.webapp.user.mapper;

import com.testlink.webapp.shared.mapper.TimeStampMapper;
import com.testlink.webapp.user.dto.UserDTO;
import com.testlink.webapp.user.entity.Authority;
import com.testlink.webapp.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;


@Mapper(
        componentModel = "spring",
        uses = {AuthorityMapper.class, TimeStampMapper.class},
        implementationName = "AuthUserMapperImpl"
)
public interface UserMapper {

    @Mapping(target = "roles", source = "authorities")
    @Mapping(target = "timeStamp", source = ".")
    UserDTO toDto(User user);

    List<UserDTO> toDtoList(List<User> users);

    default String map(Authority authority) {
        return authority.getAuthority();
    }
}