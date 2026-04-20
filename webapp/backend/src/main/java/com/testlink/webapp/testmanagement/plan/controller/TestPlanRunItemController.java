package com.testlink.webapp.testmanagement.plan.controller;

import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunItemDTO;
import com.testlink.webapp.testmanagement.plan.mapper.TestPlanRunItemMapper;
import com.testlink.webapp.testmanagement.plan.service.TestPlanRunItemService;
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
    private final ValidatePathService validatePathService;
    private final ProjectAccessService projectAccessService;
    private final TestPlanRunItemService testPlanRunItemService;
    private final TestPlanRunItemMapper testPlanRunItemMapper;

    @GetMapping("")
    public ResponseEntity<List<TestPlanRunItemDTO>> testRunsOfTestPlan(
            @PathVariable String projectKey,
            @PathVariable String testPlanId,
            @PathVariable String testRunId,
            @AuthenticationPrincipal CustomUserDetails userDetails){
        ValidatePathService.ProjectTestPlanTestPlanRun projectTestPlan = validatePathService.checkTestPlanPath(
                projectKey, testPlanId, testRunId);
        projectAccessService.checkAccessOfUserInProject(
                projectTestPlan.project(), userDetails.getUser(), ProjectRole.VIEWER);

        return ResponseEntity.ok(testPlanRunItemMapper.toDtoList(testPlanRunItemService.findAllRunItemsOfTestPlanRun(projectTestPlan.testPlanRun())));
    }

    @GetMapping("/{testRunItemId}")
    public ResponseEntity<TestPlanRunItemDTO> testRunOfIdInTestPlan(
            @PathVariable String projectKey,
            @PathVariable String testPlanId,
            @PathVariable String testRunId,
            @PathVariable String testRunItemId,
            @AuthenticationPrincipal CustomUserDetails userDetails
            )
    {
        ValidatePathService.ProjectTestPlanTestPlanRunItem testPlanRunItem = validatePathService.checkTestPlanPath(
                projectKey, testPlanId, testRunId, testRunItemId);
        projectAccessService.checkAccessOfUserInProject(
                testPlanRunItem.project(), userDetails.getUser(), ProjectRole.VIEWER);

        return ResponseEntity.ok(testPlanRunItemMapper.toDto(testPlanRunItem.testPlanRunItem()));
    }
}
