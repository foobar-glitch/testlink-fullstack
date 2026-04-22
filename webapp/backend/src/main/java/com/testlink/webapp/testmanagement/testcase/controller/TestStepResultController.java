package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.testmanagement.testcase.dto.TestStepResultDTO;
import com.testlink.webapp.testmanagement.testcase.mapper.TestStepResultMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestStepResultService;
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
@RequestMapping("/projects/project-key/{projectKey}/suite/{suiteId}/testcase-identifier/{testCaseIdentifier}/versions/{version}/content/steps/{stepId}/action")
@RequiredArgsConstructor
public class TestStepResultController {
    private final ValidatePathService validatePathService;
    private final ProjectAccessService projectAccessService;
    private final TestStepResultService testStepResultService;
    private final TestStepResultMapper testStepResultMapper;
    @GetMapping("")
    public ResponseEntity<List<TestStepResultDTO>> getTestStepResults(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @PathVariable Long testCaseIdentifier,
            @PathVariable Long version,
            @PathVariable String stepId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ValidatePathService.ProjectTestSuiteTestCaseTestVersionTestStep data = validatePathService.checkTestSuiteTestStepPath(
                projectKey, suiteId, testCaseIdentifier, version, stepId);
        projectAccessService.checkAccessOfUserInProject(data.project(), userDetails.getUser(), ProjectRole.VIEWER);
        return ResponseEntity.ok(testStepResultMapper.toDtoList(testStepResultService.findTestCaseStepsByTestCaseVersion(data.testCaseVersionStep())));
    }

    @GetMapping("/{actionId}")
    public ResponseEntity<TestStepResultDTO> getTestStepResultOfAction(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @PathVariable Long testCaseIdentifier,
            @PathVariable Long version,
            @PathVariable String stepId,
            @PathVariable String actionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ValidatePathService.ProjectTestSuiteTestCaseTestVersionTestStepResult data = validatePathService.checkTestSuiteTestStepPath(
                projectKey, suiteId, testCaseIdentifier, version, stepId, actionId);
        projectAccessService.checkAccessOfUserInProject(data.project(), userDetails.getUser(), ProjectRole.VIEWER);
        return ResponseEntity.ok(testStepResultMapper.toDto(data.testStepResult()));
    }
}
