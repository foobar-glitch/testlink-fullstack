package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.service.TestSuiteService;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseService;
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
@RequestMapping("/projects/project-key/{projectKey}/suites/{suiteId}/testcases")
@RequiredArgsConstructor
public class TestCaseController {
    private final ProjectAccessService projectAccessService;
    private final ProjectService projectService;

    private final TestSuiteService testSuiteService;
    private final TestCaseService testCaseService;
    private final TestCaseMapper testCaseMapper;

    private final ValidatePathService validatePathService;


    @GetMapping("")
    public ResponseEntity<List<TestCaseDTO>> getTestCasesOfSuite(
            @PathVariable String projectKey,
            @PathVariable Long suiteId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        ValidatePathService.ProjectTestSuite projectTestSuite = validatePathService.checkPath(projectKey, suiteId);
        User user = customUserDetails.getUser();
        ProjectMembership membership = projectAccessService.checkAccessOfUserInProject(
                projectTestSuite.project(), user, ProjectRole.VIEWER);
        List<TestCase> testCases = testCaseService.findAllTestCasesOfProjectAndSuite(
                membership.getProject(), projectTestSuite.testSuite());
        return ResponseEntity.ok(testCaseMapper.toDtoList(testCases));
    }

    @GetMapping("/{testCaseIdentifier}")
    public ResponseEntity<TestCaseDTO> getTestCaseOfProjectNumber(
            @PathVariable String projectKey,
            @PathVariable Long suiteId,
            @PathVariable Long testCaseIdentifier,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ){
        User user = customUserDetails.getUser();
        ValidatePathService.ProjectTestSuiteTestCase testSuiteTestCase = validatePathService.checkPath(projectKey, suiteId, testCaseIdentifier);

        ProjectMembership membership = projectAccessService.checkAccessOfUserInProject(
                testSuiteTestCase.project(), user, ProjectRole.VIEWER);

        return ResponseEntity.ok(testCaseMapper.toDto(testSuiteTestCase.testCase())
        );
    }



}
