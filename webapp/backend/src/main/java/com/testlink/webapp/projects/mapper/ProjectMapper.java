package com.testlink.webapp.projects.mapper;


import com.testlink.webapp.projects.dto.ProjectResponseDTO;
import com.testlink.webapp.projects.entity.ProjectTable;
import com.testlink.webapp.shared.dto.TimeStampDTO;
import com.testlink.webapp.shared.dto.UserCreatedTimeStampDTO;
import com.testlink.webapp.user.dto.UserTableDTO;
import com.testlink.webapp.user.entity.UserTable;
import com.testlink.webapp.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ProjectMapper {

    @Mapping(target = "projectId", source = "projectId")
    @Mapping(target = "projectKey", source = "projectKey")
    @Mapping(target = "displayName", source = "displayName")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "stamp", source = ".", qualifiedByName = "toUserCreatedTimeStampDTO")
    ProjectResponseDTO toDto(ProjectTable project);

    @Named("toUserCreatedTimeStampDTO")
    default UserCreatedTimeStampDTO toUserCreatedTimeStampDTO(ProjectTable project) {
        if (project == null) {
            return null;
        }
        UserTableDTO userDto = mapCreatedBy(project.getCreatedBy());
        TimeStampDTO timeStamp = TimeStampDTO.builder()
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
        return UserCreatedTimeStampDTO.builder()
                .user(userDto)
                .timeStamp(timeStamp)
                .build();
    }

    // Correct: maps UserTable → UserTableDTO
    UserTableDTO mapCreatedBy(UserTable user);
}