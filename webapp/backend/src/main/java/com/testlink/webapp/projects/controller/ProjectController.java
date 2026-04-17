package com.testlink.webapp.projects.controller;


import com.testlink.webapp.projects.dto.ProjectResponseDTO;
import com.testlink.webapp.projects.entity.ProjectTable;
import com.testlink.webapp.projects.mapper.ProjectMapper;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;


//TODO: Check read rights on project_membership, return there
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponseDTO>> getProject(@PathVariable Long id) {
        ProjectTable project = projectService.getProjectById(id);
        var response = ApiResponse.<ProjectResponseDTO>builder()
                .success(true)
                .data(projectMapper.toDto(project))
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}