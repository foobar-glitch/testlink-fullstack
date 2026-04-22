package com.testlink.webapp.testmanagement.plan.controller;

import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunItemDTO;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import com.testlink.webapp.testmanagement.plan.mapper.TestPlanRunItemMapper;
import com.testlink.webapp.testmanagement.plan.service.TestPlanRunItemService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/test-run-items")
@RequiredArgsConstructor
public class TestPlanRunItemController {
    private final ValidatePathService validatePathService;
    private final ProjectAccessService projectAccessService;
    private final TestPlanRunItemService testPlanRunItemService;
    private final TestPlanRunItemMapper testPlanRunItemMapper;

    @GetMapping("")
    public ResponseEntity<List<TestPlanRunItemDTO>> testRunsOfTestPlan(
            @RequestParam String projectKey,
            @RequestParam String testRunId,
            @AuthenticationPrincipal CustomUserDetails userDetails){
        projectAccessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        TestPlanRun testPlanRun = validatePathService.getTestPlanRun(testRunId, projectKey);

        return ResponseEntity.ok(testPlanRunItemMapper.toDtoList(testPlanRunItemService.findAllRunItemsOfTestPlanRun(
                testPlanRun)));
    }

    @GetMapping("/view")
    public ResponseEntity<TestPlanRunItemDTO> testRunOfIdInTestPlan(
            @RequestParam String projectKey,
            @RequestParam String testRunItemId,
            @AuthenticationPrincipal CustomUserDetails userDetails
            )
    {
        projectAccessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        TestPlanRunItem testPlanRunItem = validatePathService.getTestPlanRunItemByItemId(testRunItemId, projectKey);
        return ResponseEntity.ok(testPlanRunItemMapper.toDto(testPlanRunItem));
    }
}
