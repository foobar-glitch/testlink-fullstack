package com.testlink.webapp.testmanagement.plan.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.repository.TestPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestPlanService {
    private final TestPlanRepository testPlanRepository;

    public List<TestPlan> findTestPlanOfProject(Project project){
        return testPlanRepository.findAllByProject(project);
    }

    public TestPlan findByTestPlanId(Long testPlanId){
        return testPlanRepository.findById(testPlanId).orElseThrow(() -> new ResourceNotFoundException("TestPlan", "testPlanId", testPlanId));
    }
}
