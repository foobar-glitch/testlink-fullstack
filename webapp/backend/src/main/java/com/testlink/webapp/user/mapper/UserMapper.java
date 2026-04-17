package com.testlink.webapp.user.mapper;

import com.testlink.webapp.user.dto.UserTableDTO;
import com.testlink.webapp.user.entity.AuthorityTable;
import com.testlink.webapp.user.entity.UserTable;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", source = "authorities")
    UserTableDTO toDto(UserTable user);


    default String mapAuthority(AuthorityTable authority) {
        return authority.getAuthority();
    }

    default Set<String> mapAuthorities(Set<AuthorityTable> authorities) {
        if (authorities == null) return Set.of();

        return authorities.stream()
                .map(AuthorityTable::getAuthority)
                .collect(Collectors.toSet());
    }
}