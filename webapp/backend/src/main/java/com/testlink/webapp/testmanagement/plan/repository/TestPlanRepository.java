package com.testlink.webapp.testmanagement.plan.repository;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestPlanRepository extends JpaRepository<TestPlan, Long> {
    List<TestPlan> findAllByProject(Project project);

    Optional<TestPlan> findTestPlansByPublicId(UUID publicId);
}
