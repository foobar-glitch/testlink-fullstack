package com.testlink.webapp.testmanagement.plan.service;

import com.testlink.webapp.shared.exception.ResourceNotFoundException;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import com.testlink.webapp.testmanagement.plan.repository.TestPlanRunItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestPlanRunItemService {
    private final TestPlanRunItemRepository testPlanRunItemRepository;

    public TestPlanRunItem findByTestPlanRunItemId(UUID testPlanRunItemId){
        return testPlanRunItemRepository.findTestPlanRunItemsByPublicId(testPlanRunItemId).orElseThrow(
                        () -> new ResourceNotFoundException("TestPlanRunItem", "testPlanRunItemId", testPlanRunItemId)
        );
    }

    public List<TestPlanRunItem> findAllRunItemsOfTestPlanRun(TestPlanRun testPlanRun){
        return testPlanRunItemRepository.findAllByTestPlanRun(testPlanRun);
    }

}


