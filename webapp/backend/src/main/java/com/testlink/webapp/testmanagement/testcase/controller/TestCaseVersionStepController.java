package com.testlink.webapp.testmanagement.testcase.controller;


import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionStepDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseVersionStepMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseVersionStepService;
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
@RequestMapping("/projects/project-key/{projectKey}/suite/{suiteId}/testcase-identifier/{testCaseIdentifier}/versions/{version}/content/steps")
@RequiredArgsConstructor
public class TestCaseVersionStepController {
    private final TestCaseVersionStepService testCaseVersionStepService;
    private final ValidatePathService validatePathService;
    private final TestCaseVersionStepMapper testCaseVersionStepMapper;
    private final ProjectAccessService projectAccessService;

    @GetMapping("")
    public ResponseEntity<List<TestCaseVersionStepDTO>> getVersionSteps(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @PathVariable Long testCaseIdentifier,
            @PathVariable Long version,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ValidatePathService.ProjectTestSuiteTestCaseTestVersion data = validatePathService.checkTestSuitePath(
                projectKey, suiteId, testCaseIdentifier, version);
        projectAccessService.checkAccessOfUserInProject(data.project(), userDetails.getUser(), ProjectRole.VIEWER);
        List<TestCaseVersionStep> testCaseVersionSteps = testCaseVersionStepService.findTestCaseVersionStepsByTestCaseVersion(
                data.testCaseVersion());

        return ResponseEntity.ok(testCaseVersionStepMapper.toDtoList(testCaseVersionSteps));
    }

    @GetMapping("/{stepId}")
    public ResponseEntity<TestCaseVersionStepDTO> getVersionStepOfId(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @PathVariable Long testCaseIdentifier,
            @PathVariable Long version,
            @PathVariable String stepId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        ValidatePathService.ProjectTestSuiteTestCaseTestVersionTestStep data = validatePathService.checkTestSuitePath(
                projectKey, suiteId, testCaseIdentifier, version, stepId);
        projectAccessService.checkAccessOfUserInProject(data.project(), userDetails.getUser(), ProjectRole.VIEWER);
        return ResponseEntity.ok(testCaseVersionStepMapper.toDto(data.testCaseVersionStep()));
    }


}
