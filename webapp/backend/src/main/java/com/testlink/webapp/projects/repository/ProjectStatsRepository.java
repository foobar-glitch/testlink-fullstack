package com.testlink.webapp.projects.repository;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectStatsRepository  extends JpaRepository<ProjectStats, Long> {
    Optional<ProjectStats> findProjectStatsByProject(Project project);
}
