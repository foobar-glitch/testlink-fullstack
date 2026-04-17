package com.testlink.webapp.projects.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.projects.repository.ProjectMembershipRepository;
import com.testlink.webapp.projects.repository.ProjectRepository;
import com.testlink.webapp.shared.exception.AccessDeniedException;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public ProjectMembership getMemberShipOfUserAndProject(Project project, User user){
        Optional<ProjectMembership> optionalProjectMembership = membershipRepository.findByProjectAndUser(project, user);
        if (optionalProjectMembership.isEmpty()) {
            throw new AccessDeniedException(
                    user.getUserId(),
                    project.getProjectId()
            );
        }
        return optionalProjectMembership.get();
    }

    public ProjectMembership getMemberShipOfUserAndProjectId(Long projectId, User user){
        Optional<ProjectMembership> optionalProjectMembership = membershipRepository.
                findByProject_ProjectIdAndUser(projectId, user);
        if (optionalProjectMembership.isEmpty()) {
            throw new AccessDeniedException(
                    user.getUserId(),
                    projectId
            );
        }
        return optionalProjectMembership.get();
    }

}