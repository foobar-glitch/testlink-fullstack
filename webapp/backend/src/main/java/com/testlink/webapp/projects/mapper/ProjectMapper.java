package com.testlink.webapp.projects.mapper;


import com.testlink.webapp.projects.dto.ProjectResponseDTO;
import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public abstract class ProjectMapper extends BaseAuditMapper {

    @Mapping(target = "projectId", source = "projectId")
    @Mapping(target = "projectKey", source = "projectKey")
    @Mapping(target = "displayName", source = "displayName")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "stamp", expression = "java(mapAudit(project))")
    public abstract ProjectResponseDTO toDto(Project project);
}