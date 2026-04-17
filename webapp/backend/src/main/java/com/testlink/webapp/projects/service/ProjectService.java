package com.testlink.webapp.projects.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.repository.ProjectMembershipRepository;
import com.testlink.webapp.projects.repository.ProjectRepository;
import com.testlink.webapp.shared.exception.AccessDeniedException;
import com.testlink.webapp.shared.exception.InsufficientAuthorityException;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository membershipRepository;

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }

    public Project getProjectByKey(String projectKey) {
        return projectRepository.findByProjectKey(projectKey)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "key", projectKey));
    }

    public List<ProjectMembership> getMemberships(Long projectId) {
        return membershipRepository.findByProject_ProjectId(projectId);
    }

    public List<ProjectMembership> getUserProjects(User user){
        return membershipRepository.findByUser(user);
    }

    public boolean hasMembership(Project project, User user) {
        return membershipRepository.existsByProjectAndUser(project, user);
    }

    private ProjectMembership getMemberShipOfUserAndProject(Project project, User user){
        Optional<ProjectMembership> optionalProjectMembership = membershipRepository.findByProjectAndUser(project, user);
        if (optionalProjectMembership.isEmpty()) {
            throw new AccessDeniedException(
                    user.getUserId(),
                    project.getProjectId()
            );
        }
        return optionalProjectMembership.get();
    }

    public void verifyMemberShipRights(Project project, User user, ProjectRole requiredRole){
        ProjectMembership membership = this.getMemberShipOfUserAndProject(project, user);
        ProjectRole userRole = membership.getRole();
        if(!userRole.hasAtLeast(requiredRole)){
            throw new InsufficientAuthorityException(user.getUserId(), project.getProjectId(), requiredRole, userRole);
        }
    }

}