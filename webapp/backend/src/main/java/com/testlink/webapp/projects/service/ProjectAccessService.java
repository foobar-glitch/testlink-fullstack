package com.testlink.webapp.projects.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.shared.exception.InsufficientAuthorityException;
import com.testlink.webapp.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectAccessService {
    private final ProjectService projectService;

    public ProjectMembership checkAccessOfUserInProject(Project project, User user, ProjectRole requiredRole) {
        ProjectMembership membership = projectService.getMemberShipOfUserAndProject(project, user);
        ProjectRole userRole = membership.getRole();
        if(!userRole.hasAtLeast(requiredRole)){
            throw new InsufficientAuthorityException(user.getUserId(), project.getProjectId(), requiredRole, userRole);
        }
        return membership;
    }

    public ProjectMembership checkAccessOfUserInProject(
            Long projectId,
            User user,
            ProjectRole requiredRole) {
        ProjectMembership membership = projectService.getMemberShipOfUserAndProjectId(projectId, user);
        ProjectRole userRole = membership.getRole();
        if (!userRole.hasAtLeast(requiredRole)) {
            throw new InsufficientAuthorityException(user.getUserId(), projectId, requiredRole, userRole);
        }
        return membership;
    }
}
