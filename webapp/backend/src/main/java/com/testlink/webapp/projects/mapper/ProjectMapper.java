package com.testlink.webapp.projects.mapper;


import com.testlink.webapp.projects.dto.ProjectDTO;
import com.testlink.webapp.projects.dto.ProjectMembershipDTO;
import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
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
    public abstract ProjectDTO toDto(Project project);


    @Mapping(target = "user", source = "user")
    @Mapping(target = "project", source = "project")
    @Mapping(target = "role", source = "role")
    public abstract ProjectMembershipDTO toMembershipDto(ProjectMembership membership);
}