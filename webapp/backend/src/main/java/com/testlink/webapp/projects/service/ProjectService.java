package com.testlink.webapp.projects.service;

import com.testlink.webapp.projects.entity.ProjectTable;
import com.testlink.webapp.projects.repository.ProjectTableRepository;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectTableRepository projectRepository;

    public ProjectTable getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }

    public ProjectTable getProjectByKey(String projectKey) {
        return projectRepository.findByProjectKey(projectKey)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "key", projectKey));
    }
}