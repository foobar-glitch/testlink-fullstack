package com.testlink.webapp.user.mapper;

import com.testlink.webapp.user.dto.UserDTO;
import com.testlink.webapp.user.entity.Authority;
import com.testlink.webapp.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", source = "authorities")
    UserDTO toDto(User user);


    default String mapAuthority(Authority authority) {
        return authority.getAuthority();
    }

    default Set<String> mapAuthorities(Set<Authority> authorities) {
        if (authorities == null) return Set.of();

        return authorities.stream()
                .map(Authority::getAuthority)
                .collect(Collectors.toSet());
    }
}