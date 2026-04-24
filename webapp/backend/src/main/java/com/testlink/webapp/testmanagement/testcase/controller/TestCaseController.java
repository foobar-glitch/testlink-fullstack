package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseDTO;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseStatsDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseMapper;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseStatsMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import com.testlink.webapp.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/testcases")
@RequiredArgsConstructor
public class TestCaseController {
    private final ProjectService projectService;
    private final ProjectAccessService projectAccessService;
    private final TestCaseService testCaseService;
    private final TestCaseMapper testCaseMapper;
    private final TestCaseStatsMapper testCaseStatsMapper;

    private final ValidatePathService validatePathService;


    @GetMapping("")
    public ResponseEntity<List<TestCaseDTO>> getTestCasesOfSuite(
            @RequestParam String projectKey,
            @RequestParam String suiteId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TestSuite testSuite = validatePathService.getTestSuite(projectKey, suiteId);
        Project project = projectService.getProjectByKey(projectKey);
        User user = customUserDetails.getUser();
        projectAccessService.checkAccessOfUserInProject(
                project, user, ProjectRole.VIEWER);
        List<TestCase> testCases = testCaseService.findAllTestCasesOfProjectAndSuite(
                project, testSuite);
        return ResponseEntity.ok(testCaseMapper.toDtoList(testCases));
    }

    @GetMapping("/view")
    public ResponseEntity<TestCaseDTO> getTestCaseOfProjectNumber(
            @RequestParam String projectKey,
            @RequestParam Long testCaseIdentifier,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ){
        User user = customUserDetails.getUser();
        Project project = projectService.getProjectByKey(projectKey);
        TestCase testCase = validatePathService.getTestCase(projectKey, testCaseIdentifier);
        projectAccessService.checkAccessOfUserInProject(project, user, ProjectRole.VIEWER);

        return ResponseEntity.ok(testCaseMapper.toDto(testCase)
        );
    }

    @GetMapping("/view/stats")
    public ResponseEntity<TestCaseStatsDTO> getTestCaseStats(
            @RequestParam String projectKey,
            @RequestParam Long testCaseIdentifier,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        projectAccessService.checkAccessOfUserInProject(
                projectKey, customUserDetails.getUser(), ProjectRole.VIEWER);
        TestCase testCase = validatePathService.getTestCase(projectKey, testCaseIdentifier);

        return ResponseEntity.ok(
                testCaseStatsMapper.toDto(testCaseService.findTestCaseStatsByTestCase(testCase))
        );
    }


}
