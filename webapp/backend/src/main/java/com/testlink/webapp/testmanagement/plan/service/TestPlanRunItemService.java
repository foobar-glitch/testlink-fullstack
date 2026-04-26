package com.testlink.webapp.testmanagement.plan.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import com.testlink.webapp.testmanagement.plan.repository.TestPlanRepository;
import com.testlink.webapp.testmanagement.plan.repository.TestPlanRunItemRepository;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static com.testlink.webapp.shared.util.IdUtil.fromBase62;

@Service
@RequiredArgsConstructor
public class TestPlanRunItemService {
    private final TestPlanRunItemRepository testPlanRunItemRepository;

    public TestPlanRunItem findByTestPlanRunItemId(UUID testPlanRunItemId, Project project){
        return testPlanRunItemRepository.findByPublicIdAndProject(testPlanRunItemId, project).orElseThrow(
                        () -> new ResourceNotFoundException("TestPlanRunItem", "testPlanRunItemId", testPlanRunItemId)
        );
    }

    public List<TestPlanRunItem> findAllRunItemsOfTestPlanRun(TestPlanRun testPlanRun){
        return testPlanRunItemRepository.findAllByTestPlanRun(testPlanRun);
    }

    public List<TestPlanRunItem> findAllRunItemsOfTestCaseVersion(TestCaseVersion testCaseVersion, UUID testPlanId){
        return testPlanRunItemRepository.findAllByTestCaseVersionAndTestPlanPublicId(testCaseVersion, testPlanId);
    }

}


