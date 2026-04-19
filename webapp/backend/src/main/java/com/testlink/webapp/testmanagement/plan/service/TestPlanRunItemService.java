package com.testlink.webapp.testmanagement.plan.service;

import com.testlink.webapp.testmanagement.plan.repository.TestPlanRunItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestPlanRunItemService {
    private final TestPlanRunItemRepository testPlanRunItemRepository;

}


