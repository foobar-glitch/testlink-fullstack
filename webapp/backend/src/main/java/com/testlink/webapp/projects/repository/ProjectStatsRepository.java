package com.testlink.webapp.projects.repository;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectStatsRepository  extends JpaRepository<ProjectStats, Long> {
    Optional<ProjectStats> findProjectStatsByProject(Project project);
}
