package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.testmanagement.testcase.dto.TestStepResultDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import com.testlink.webapp.testmanagement.testcase.entity.TestStepResult;
import com.testlink.webapp.testmanagement.testcase.mapper.TestStepResultMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestStepResultService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/test-step-results")
@RequiredArgsConstructor
public class TestStepResultController {
    private final ValidatePathService validatePathService;
    private final ProjectAccessService projectAccessService;
    private final TestStepResultService testStepResultService;
    private final TestStepResultMapper testStepResultMapper;
    @GetMapping("")
    public ResponseEntity<List<TestStepResultDTO>> getTestStepResults(
            @RequestParam String projectKey,
            @RequestParam String testPlanId,
            @RequestParam String stepId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        projectAccessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        TestCaseVersionStep testCaseVersionStep = validatePathService.getTestCaseVersionStepOfProjectKey(stepId, testPlanId, projectKey);
        return ResponseEntity.ok(testStepResultMapper.toDtoList(testStepResultService.findTestCaseStepsByTestCaseVersion(testCaseVersionStep)));
    }

    @GetMapping("/view")
    public ResponseEntity<TestStepResultDTO> getTestStepResultOfAction(
            @RequestParam String projectKey,
            @RequestParam String actionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        projectAccessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        TestStepResult testStepResult = validatePathService.getTestStepResultOfProjectKey(actionId, projectKey);
        return ResponseEntity.ok(testStepResultMapper.toDto(testStepResult));
    }
}
