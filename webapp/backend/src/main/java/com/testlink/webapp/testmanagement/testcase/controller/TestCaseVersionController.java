package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunItemDTO;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import com.testlink.webapp.testmanagement.plan.mapper.TestPlanRunItemMapper;
import com.testlink.webapp.testmanagement.plan.service.TestPlanRunItemService;
import com.testlink.webapp.testmanagement.plan.service.TestPlanService;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionDTO;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionPlanStatsDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseVersionMapper;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseVersionPlanStatsMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseVersionService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import com.testlink.webapp.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.testlink.webapp.shared.util.IdUtil.fromBase62;

@RestController
@RequestMapping("/test-case-versions")
@RequiredArgsConstructor
public class TestCaseVersionController {
    private final ProjectService projectService;
    private final ProjectAccessService projectAccessService;

    private final TestCaseVersionService testCaseVersionService;
    private final TestCaseVersionMapper testCaseVersionMapper;
    private final TestCaseVersionPlanStatsMapper testCaseVersionPlanStatsMapper;

    private final TestPlanRunItemService testPlanRunItemService;
    private final TestPlanRunItemMapper testPlanRunItemMapper;

    private final ValidatePathService validatePathService;
    private final TestPlanService testPlanService;

    @GetMapping("")
    public ResponseEntity<List<TestCaseVersionDTO>> getVersions(
            @RequestParam String projectKey,
            @RequestParam Long testCaseIdentifier,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        projectAccessService.checkAccessOfUserInProject(projectKey, user, ProjectRole.VIEWER);

        TestCase testCase = validatePathService.getTestCase(projectKey, testCaseIdentifier);
        List<TestCaseVersion> versions = testCaseVersionService.getVersionsForTestCase(testCase);
        return ResponseEntity.ok(testCaseVersionMapper.toDtoList(versions));
    }

    @GetMapping("/view")
    public ResponseEntity<TestCaseVersionDTO> getVersion(
            @RequestParam String projectKey,
            @RequestParam Long testCaseIdentifier,
            @RequestParam Long versionNumber,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        projectAccessService.checkAccessOfUserInProject(projectKey, user, ProjectRole.VIEWER);
        TestCaseVersion testCaseVersion = validatePathService.getTestCaseVersion(projectKey, testCaseIdentifier, versionNumber);
        return ResponseEntity.ok(testCaseVersionMapper.toDto(testCaseVersion));
    }

    @GetMapping("/view/stats/testplan")
    public ResponseEntity<TestCaseVersionPlanStatsDTO> getStatsOfVersion(
            @RequestParam String projectKey,
            @RequestParam String testPlanId,
            @RequestParam Long testCaseIdentifier,
            @RequestParam Long versionNumber,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        Project project = projectService.getProjectByKey(projectKey);
        projectAccessService.checkAccessOfUserInProject(project, user, ProjectRole.VIEWER);

        TestCaseVersion testCaseVersion = validatePathService.getTestCaseVersion(projectKey, testCaseIdentifier, versionNumber);
        TestPlan testPlan = testPlanService.findByTestPlanId(fromBase62(testPlanId), project);

        return ResponseEntity.ok(testCaseVersionPlanStatsMapper.toDto(
                testCaseVersionService.findTestCaseVersionStatsByTestCaseVersion(testCaseVersion,testPlan))
        );
    }

    @GetMapping("/runs")
    public ResponseEntity<List<TestPlanRunItemDTO>> getRunsForVersion(
            @RequestParam String projectKey,
            @RequestParam Long testCaseIdentifier,
            @RequestParam Long versionNumber,
            @RequestParam String testPlanId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // validate path and access, then fetch run items for that test case version
        User user = userDetails.getUser();
        projectAccessService.checkAccessOfUserInProject(projectKey, user, ProjectRole.VIEWER);
        TestCaseVersion testCaseVersion = validatePathService.getTestCaseVersion(projectKey, testCaseIdentifier, versionNumber);
        return ResponseEntity.ok(testPlanRunItemMapper.toDtoList(validatePathService.getTestPlanRunItemOfTestCaseVersionAndTestPlanId(testCaseVersion, testPlanId)));
    }

    @GetMapping("/runs/view")
    public ResponseEntity<TestPlanRunItemDTO> getRunOfVersionOfId(
            @RequestParam String projectKey,
            @RequestParam String runId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        projectAccessService.checkAccessOfUserInProject(projectKey, user, ProjectRole.VIEWER);
        TestPlanRunItem testPlanRunItem = validatePathService.getTestPlanRunItemByItemIdOfProjectKey(runId, projectKey);
        return ResponseEntity.ok(testPlanRunItemMapper.toDto(testPlanRunItem));
    }

}



