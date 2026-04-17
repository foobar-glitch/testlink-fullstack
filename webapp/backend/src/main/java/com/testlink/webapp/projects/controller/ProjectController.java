package com.testlink.webapp.projects.controller;


import com.testlink.webapp.projects.dto.ProjectDTO;
import com.testlink.webapp.projects.dto.ProjectMembershipDTO;
import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.projects.mapper.ProjectMapper;
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


//TODO: Check read rights on project_membership, return there
@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

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
}