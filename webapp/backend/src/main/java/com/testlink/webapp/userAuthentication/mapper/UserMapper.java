package com.testlink.webapp.userAuthentication.mapper;

import com.testlink.webapp.userAuthentication.dto.UserTableDTO;
import com.testlink.webapp.userAuthentication.dto.UserTablesAdminDTO;
import com.testlink.webapp.userAuthentication.entity.TempUser;
import com.testlink.webapp.userAuthentication.entity.UserTable;
import org.apache.catalina.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRoles")
    UserTableDTO toDto(UserTable user);

    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRoles")
    UserTablesAdminDTO toAdminDto(UserTable user);

    @Named("mapRoles")
    default Set<String> mapRoles(Set<Role> roles) {
        if (roles == null) return Set.of();

        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
}