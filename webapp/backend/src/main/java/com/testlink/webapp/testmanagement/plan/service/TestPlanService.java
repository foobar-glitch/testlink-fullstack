package com.testlink.webapp.testmanagement.plan.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanStats;
import com.testlink.webapp.testmanagement.plan.repository.TestPlanRepository;
import com.testlink.webapp.testmanagement.plan.repository.TestPlanStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestPlanService {
    private final TestPlanRepository testPlanRepository;
    private final TestPlanStatsRepository testPlanStatsRepository;

    public List<TestPlan> findTestPlanOfProject(Project project){
        return testPlanRepository.findAllByProject(project);
    }

    public TestPlan findByTestPlanId(UUID testPlanId, Project project){
        return testPlanRepository.findByPublicIdAndProject(testPlanId, project).orElseThrow(
                () -> new ResourceNotFoundException("TestPlan", "testPlanId", testPlanId));
    }

    public TestPlanStats findTestPlanStatsByTestPlan(TestPlan testPlan){
        return testPlanStatsRepository.findTestPlanStatsByTestPlan(testPlan).orElseThrow(
                () -> new ResourceNotFoundException("TestPlanStats", "testPlanId", testPlan.getPublicId())
        );
    }
}
