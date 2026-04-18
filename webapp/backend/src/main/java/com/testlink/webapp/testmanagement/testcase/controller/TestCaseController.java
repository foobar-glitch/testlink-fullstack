package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.service.TestSuiteService;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseDTO;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseMapper;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseVersionMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseService;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseVersionService;
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
@RequestMapping("/projects")
@RequiredArgsConstructor
public class TestCaseController {
    private final ProjectAccessService projectAccessService;
    private final ProjectService projectService;

    private final TestSuiteService testSuiteService;
    private final TestCaseService testCaseService;
    private final TestCaseMapper testCaseMapper;

    @GetMapping("/{projectId}/suites/{suiteId}/cases")
    public ResponseEntity<List<TestCaseDTO>> getTestCasesOfSuite(
            @PathVariable Long projectId,
            @PathVariable Long suiteId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        User user = customUserDetails.getUser();
        ProjectMembership membership = projectAccessService.checkAccessOfUserInProject(
                projectId, user, ProjectRole.VIEWER);
        TestSuite testSuite = testSuiteService.findBySuiteId(suiteId);
        List<TestCase> testCases = testCaseService.findAllTestCasesOfProjectAndSuite(
                membership.getProject(), testSuite);
        return ResponseEntity.ok(testCaseMapper.toDtoList(testCases));
    }

    @GetMapping("/testcase/{projectKey}/{testCaseIdentifier}")
    public ResponseEntity<TestCaseDTO> getTestCaseOfProjectNumber(
            @PathVariable String projectKey,
            @PathVariable Long testCaseIdentifier,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ){
        User user = customUserDetails.getUser();
        Project project = projectService.getProjectByKey(projectKey);
        ProjectMembership membership = projectAccessService.checkAccessOfUserInProject(
                project, user, ProjectRole.VIEWER);
        return ResponseEntity.ok(testCaseMapper.toDto(
                testCaseService.findByProjectAndIdentifierNumber(membership.getProject(), testCaseIdentifier))
        );
    }



}
