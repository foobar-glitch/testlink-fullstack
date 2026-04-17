package com.testlink.webapp.projects.repository;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMembershipRepository extends JpaRepository<ProjectMembership, Long> {
    List<ProjectMembership> findByProject(Project project);
    List<ProjectMembership> findByUser(User user);
    Optional<ProjectMembership> findByProjectAndUser(Project project, User user);
    boolean existsByProjectAndUser(Project project, User user);

    List<ProjectMembership> findByProject_ProjectId(Long projectId);
    List<ProjectMembership> findByUser_UserId(Long userId);
    Optional<ProjectMembership> findByProject_ProjectIdAndUser_UserId(Long projectId, Long userId);
    boolean existsByProject_ProjectIdAndUser_UserId(Long projectId, Long userId);

    // Optional: Delete all memberships for a project
    void deleteByProject_ProjectId(Long projectId);
}