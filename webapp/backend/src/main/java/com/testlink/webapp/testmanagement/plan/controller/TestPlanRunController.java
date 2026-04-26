package com.testlink.webapp.testmanagement.plan.controller;


import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunDTO;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import com.testlink.webapp.testmanagement.plan.mapper.TestPlanRunMapper;
import com.testlink.webapp.testmanagement.plan.service.TestPlanRunService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/testruns")
@RequiredArgsConstructor
public class TestPlanRunController {
    private final ProjectAccessService projectAccessService;
    private final ValidatePathService validatePathService;
    private final TestPlanRunService testPlanRunService;
    private final TestPlanRunMapper testPlanRunMapper;


    @GetMapping("")
    public ResponseEntity<List<TestPlanRunDTO>> testRunsOfTestPlan(@RequestParam String projectKey, @RequestParam String testPlanId, @AuthenticationPrincipal CustomUserDetails userDetails){
        projectAccessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        TestPlan testPlan = validatePathService.getTestPlanOfProjectKey(testPlanId, projectKey);
        return ResponseEntity.ok(testPlanRunMapper.toDtoList(testPlanRunService.findAllRunsOfTestPlan(testPlan)));
    }


    // of @RequestParam String testPlanId
    @GetMapping("/view")
    public ResponseEntity<TestPlanRunDTO> testRunOfId(
            @RequestParam String projectKey,
            @RequestParam String testPlanId,
            @RequestParam String testRunId,
            @AuthenticationPrincipal CustomUserDetails userDetails){
        projectAccessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        TestPlanRun testPlanRun = validatePathService.getTestPlanRunOfProjectKeyAndTestPlanId(testRunId, testPlanId, projectKey);
        return ResponseEntity.ok(testPlanRunMapper.toDto(testPlanRun));
    }
}
