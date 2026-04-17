package com.testlink.webapp.projects.repository;

import com.testlink.webapp.projects.entity.ProjectTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectTableRepository extends JpaRepository<ProjectTable, Long> {
    Optional<ProjectTable> findByProjectKey(String projectKey);
}
