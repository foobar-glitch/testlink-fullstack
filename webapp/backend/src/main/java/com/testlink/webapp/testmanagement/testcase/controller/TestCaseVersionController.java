package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunItemDTO;
import com.testlink.webapp.testmanagement.plan.mapper.TestPlanRunItemMapper;
import com.testlink.webapp.testmanagement.plan.service.TestPlanRunItemService;
import com.testlink.webapp.testmanagement.suite.service.TestSuiteService;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionDTO;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionStatsDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseVersionMapper;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseVersionStatsMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseService;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseVersionService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import com.testlink.webapp.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/projects/project-key/{projectKey}/suite/{suiteId}/testcase-identifier/{testCaseIdentifier}/versions")
@RequiredArgsConstructor
public class TestCaseVersionController {
    private final ProjectAccessService projectAccessService;

    private final TestCaseVersionService testCaseVersionService;
    private final TestCaseVersionMapper testCaseVersionMapper;
    private final TestCaseVersionStatsMapper testCaseVersionStatsMapper;

    private final TestPlanRunItemService testPlanRunItemService;
    private final TestPlanRunItemMapper testPlanRunItemMapper;

    private final ValidatePathService validatePathService;

    @GetMapping("")
    public ResponseEntity<List<TestCaseVersionDTO>> getVersions(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @PathVariable Long testCaseIdentifier,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        ValidatePathService.ProjectTestSuiteTestCase testSuiteTestCase = validatePathService.checkTestSuitePath(projectKey, suiteId, testCaseIdentifier);

        projectAccessService.checkAccessOfUserInProject(testSuiteTestCase.project(), user, ProjectRole.VIEWER);
        List<TestCaseVersion> versions = testCaseVersionService.getVersionsForTestCase(testSuiteTestCase.testCase());
        return ResponseEntity.ok(testCaseVersionMapper.toDtoList(versions));
    }

    @GetMapping("/{versionNumber}")
    public ResponseEntity<TestCaseVersionDTO> getVersion(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @PathVariable Long testCaseIdentifier,
            @PathVariable Long versionNumber,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        ValidatePathService.ProjectTestSuiteTestCaseTestVersion projectTestSuiteTestCaseTestVersion = validatePathService.checkTestSuitePath(projectKey, suiteId, testCaseIdentifier, versionNumber);
        projectAccessService.checkAccessOfUserInProject(projectTestSuiteTestCaseTestVersion.project(), user, ProjectRole.VIEWER);

        return ResponseEntity.ok(testCaseVersionMapper.toDto(projectTestSuiteTestCaseTestVersion.testCaseVersion()));
    }

    @GetMapping("/{versionNumber}/stats")
    public ResponseEntity<TestCaseVersionStatsDTO> getStatsOfVersion(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @PathVariable Long testCaseIdentifier,
            @PathVariable Long versionNumber,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        ValidatePathService.ProjectTestSuiteTestCaseTestVersion projectTestSuiteTestCaseTestVersion = validatePathService.checkTestSuitePath(projectKey, suiteId, testCaseIdentifier, versionNumber);
        projectAccessService.checkAccessOfUserInProject(projectTestSuiteTestCaseTestVersion.project(), user, ProjectRole.VIEWER);
        return ResponseEntity.ok(testCaseVersionStatsMapper.toDto(testCaseVersionService.findTestCaseVersionStatsByTestCaseVersion(projectTestSuiteTestCaseTestVersion.testCaseVersion())));
    }

    @GetMapping("/{versionNumber}/runs")
    public ResponseEntity<List<TestPlanRunItemDTO>> getRunsForVersion(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @PathVariable Long testCaseIdentifier,
            @PathVariable Long versionNumber,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // validate path and access, then fetch run items for that test case version
        User user = userDetails.getUser();
        ValidatePathService.ProjectTestSuiteTestCaseTestVersion projectTestSuiteTestCaseTestVersion = validatePathService.checkTestSuitePath(projectKey, suiteId, testCaseIdentifier, versionNumber);
        projectAccessService.checkAccessOfUserInProject(projectTestSuiteTestCaseTestVersion.project(), user, ProjectRole.VIEWER);
        TestCaseVersion testCaseVersion = projectTestSuiteTestCaseTestVersion.testCaseVersion();
        return ResponseEntity.ok(testPlanRunItemMapper.toDtoList(testPlanRunItemService.findAllRunItemsOfTestCaseVersion(testCaseVersion)));
    }

    @GetMapping("/{versionNumber}/runs/{runId}")
    public ResponseEntity<TestPlanRunItemDTO> getRunOfVersionOfId(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @PathVariable Long testCaseIdentifier,
            @PathVariable Long versionNumber,
            @PathVariable String runId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        ValidatePathService.ProjectTestPlanRunItem projectTestPlanRunItem = validatePathService.checkTestSuiteTestRunPath(projectKey, suiteId, testCaseIdentifier, versionNumber, runId);
        projectAccessService.checkAccessOfUserInProject(projectTestPlanRunItem.project(), user, ProjectRole.VIEWER);
        return ResponseEntity.ok(testPlanRunItemMapper.toDto(projectTestPlanRunItem.testPlanRunItem()));
    }

}



