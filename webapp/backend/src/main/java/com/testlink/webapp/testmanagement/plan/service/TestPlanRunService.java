package com.testlink.webapp.testmanagement.plan.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import com.testlink.webapp.testmanagement.plan.repository.TestPlanRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestPlanRunService {
    private final TestPlanRunRepository testPlanRunRepository;

    public List<TestPlanRun> findAllRunsOfTestPlan(TestPlan testPlan){
        return testPlanRunRepository.findAllByTestPlan(testPlan);
    }

    public TestPlanRun findByTestRunId(UUID testRunId, Project project){
        return testPlanRunRepository.findByPublicIdAndProject(testRunId, project).orElseThrow(() -> new ResourceNotFoundException("TestPlanRun", "testPlanRunId", testRunId));
    }
}
