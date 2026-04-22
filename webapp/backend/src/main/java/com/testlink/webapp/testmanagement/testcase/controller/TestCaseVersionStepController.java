package com.testlink.webapp.testmanagement.testcase.controller;


import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionStepDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseVersionStepMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseVersionStepService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/test-steps/")
@RequiredArgsConstructor
public class TestCaseVersionStepController {
    private final TestCaseVersionStepService testCaseVersionStepService;
    private final ValidatePathService validatePathService;
    private final TestCaseVersionStepMapper testCaseVersionStepMapper;
    private final ProjectAccessService projectAccessService;

    @GetMapping("")
    public ResponseEntity<List<TestCaseVersionStepDTO>> getVersionSteps(
            @RequestParam String projectKey,
            @RequestParam Long testCaseIdentifier,
            @RequestParam Long version,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        projectAccessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        TestCaseVersion testCaseVersion = validatePathService.getTestCaseVersion(projectKey, testCaseIdentifier, version);
        List<TestCaseVersionStep> testCaseVersionSteps = testCaseVersionStepService.findTestCaseVersionStepsByTestCaseVersion(
                testCaseVersion);
        return ResponseEntity.ok(testCaseVersionStepMapper.toDtoList(testCaseVersionSteps));
    }

    @GetMapping("/step")
    public ResponseEntity<TestCaseVersionStepDTO> getVersionStepOfId(
            @RequestParam String projectKey,
            @RequestParam String stepId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        projectAccessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        TestCaseVersionStep testCaseVersionStep = validatePathService.getTestCaseVersionStep(stepId, projectKey);
        return ResponseEntity.ok(testCaseVersionStepMapper.toDto(testCaseVersionStep));
    }


}
