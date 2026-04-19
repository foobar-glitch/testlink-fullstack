package com.testlink.webapp.testmanagement.plan.controller;

import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunDTO;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunItemDTO;
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
@RequestMapping("/projects/project-key/{projectKey}/testplans/{testPlanId}/testruns/{testRunId}/items")
@RequiredArgsConstructor
public class TestPlanRunItemController {

    @GetMapping("")
    public ResponseEntity<List<TestPlanRunItemDTO>> testRunsOfTestPlan(@PathVariable String projectKey, @PathVariable Long testPlanId, @PathVariable Long testRunId, @AuthenticationPrincipal CustomUserDetails userDetails){
        ValidatePathService.ProjectTestPlan projectTestPlan = validatePathService.checkTestPlanPath(projectKey, testPlanId);
        projectAccessService.checkAccessOfUserInProject(projectTestPlan.project(), userDetails.getUser(), ProjectRole.VIEWER);
        return ResponseEntity.ok(testPlanRunMapper.toDtoList(testPlanRunService.findAllRunsOfTestPlan(projectTestPlan.testPlan())));
    }
}
