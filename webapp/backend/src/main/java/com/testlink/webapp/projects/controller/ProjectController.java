package com.testlink.webapp.projects.controller;


import com.testlink.webapp.projects.dto.ProjectDTO;
import com.testlink.webapp.projects.dto.ProjectMembershipDTO;
import com.testlink.webapp.projects.dto.ProjectStatsDTO;
import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.projects.mapper.ProjectMapper;
import com.testlink.webapp.projects.mapper.ProjectStatsMapper;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;
    private final ProjectMapper projectMapper;
    private final ProjectStatsMapper projectStatsMapper;

    @GetMapping("/assigned")
    public ResponseEntity<List<ProjectMembershipDTO>> getProjectOfUser(
            @AuthenticationPrincipal CustomUserDetails userDetails){
        List<ProjectMembership> projectMembership = projectService.getUserProjects(userDetails.getUser());
        return ResponseEntity.ok(projectMapper.toMembershipDtoList(projectMembership));
    }


    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProject(@PathVariable Long id) {
        Project project = projectService.getProjectById(id);
        return ResponseEntity.ok(projectMapper.toDto(project));
    }

    @GetMapping("/project-key/{projectKey}")
    public ResponseEntity<ProjectDTO> getProjectByKey(@PathVariable String projectKey){
        return ResponseEntity.ok(projectMapper.toDto(projectService.getProjectByKey(projectKey)));
    }

    @GetMapping("/project-key/{projectKey}/stats")
    public ResponseEntity<ProjectStatsDTO> getProjectStatsOfKey(@PathVariable String projectKey){
        Project project = projectService.getProjectByKey(projectKey);
        return ResponseEntity.ok(projectStatsMapper.toDto(projectService.getProjectStatsOfProject(project)));
    }
}