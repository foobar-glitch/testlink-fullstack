package com.testlink.webapp.userAuthentication.mapper;

import com.testlink.webapp.userAuthentication.dto.UserTableDTO;
import com.testlink.webapp.userAuthentication.dto.UserTablesAdminDTO;
import com.testlink.webapp.userAuthentication.entity.AuthorityTable;
import com.testlink.webapp.userAuthentication.entity.UserTable;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", source = "authorities")
    UserTableDTO toDto(UserTable user);

    @Mapping(target = "roles", source = "authorities")
    UserTablesAdminDTO toAdminDto(UserTable user);

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