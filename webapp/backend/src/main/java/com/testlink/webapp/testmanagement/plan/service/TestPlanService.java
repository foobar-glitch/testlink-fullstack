package com.testlink.webapp.testmanagement.plan.service;

import com.testlink.webapp.testmanagement.plan.repository.TestPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestPlanService {
    private final TestPlanRepository testPlanRepository;

}
