package com.testlink.webapp.testmanagement.plan.controller;


import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunDTO;
import com.testlink.webapp.testmanagement.plan.mapper.TestPlanRunMapper;
import com.testlink.webapp.testmanagement.plan.service.TestPlanRunService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/projects/project-key/{projectKey}/testplans/{testPlanId}/testruns")
@RequiredArgsConstructor
public class TestPlanRunController {
    private final ProjectAccessService projectAccessService;
    private final ValidatePathService validatePathService;
    private final TestPlanRunService testPlanRunService;
    private final TestPlanRunMapper testPlanRunMapper;


    @GetMapping("")
    public ResponseEntity<List<TestPlanRunDTO>> testRunsOfTestPlan(@PathVariable String projectKey, @PathVariable String testPlanId, @AuthenticationPrincipal CustomUserDetails userDetails){
        ValidatePathService.ProjectTestPlan projectTestPlan = validatePathService.checkTestPlanPath(projectKey, testPlanId);
        projectAccessService.checkAccessOfUserInProject(projectTestPlan.project(), userDetails.getUser(), ProjectRole.VIEWER);
        return ResponseEntity.ok(testPlanRunMapper.toDtoList(testPlanRunService.findAllRunsOfTestPlan(projectTestPlan.testPlan())));
    }

    @GetMapping("/{testRunId}")
    public ResponseEntity<TestPlanRunDTO> testRunOfId(@PathVariable String projectKey, @PathVariable String testPlanId, @PathVariable String testRunId, @AuthenticationPrincipal CustomUserDetails userDetails){
        ValidatePathService.ProjectTestPlanTestPlanRun projectTestPlanTestPlanRun = validatePathService.checkTestPlanPath(projectKey, testPlanId, testRunId);
        projectAccessService.checkAccessOfUserInProject(projectTestPlanTestPlanRun.project(), userDetails.getUser(), ProjectRole.VIEWER);
        return ResponseEntity.ok(testPlanRunMapper.toDto(projectTestPlanTestPlanRun.testPlanRun()));
    }
}
