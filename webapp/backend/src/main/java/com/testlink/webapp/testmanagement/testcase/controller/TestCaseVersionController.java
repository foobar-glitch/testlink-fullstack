package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
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
public class TestCaseVersionController {
    private final ProjectService projectService;
    private final ProjectAccessService projectAccessService;

    private final TestCaseService testCaseService;
    private final TestCaseVersionService testCaseVersionService;
    private final TestCaseVersionMapper testCaseVersionMapper;


    @GetMapping("/testcase/{projectKey}/{testCaseIdentifier}/versions")
    public ResponseEntity<List<TestCaseVersionDTO>> getVersions(
            @PathVariable String projectKey,
            @PathVariable Long testCaseIdentifier,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        Project project = projectService.getProjectByKey(projectKey);
        ProjectMembership membership = projectAccessService.checkAccessOfUserInProject(
                project, user, ProjectRole.VIEWER);
        TestCase testCase = testCaseService.findByProjectAndIdentifierNumber(membership.getProject(), testCaseIdentifier);
        List<TestCaseVersion> versions = testCaseVersionService.getVersionsForTestCase(testCase);
        return ResponseEntity.ok(testCaseVersionMapper.toDtoList(versions));
    }

    @GetMapping("/testcase/{projectKey}/{testCaseIdentifier}/version/{versionNumber}")
    public ResponseEntity<TestCaseVersionDTO> getVersion(
            @PathVariable String projectKey,
            @PathVariable Long testCaseIdentifier,
            @PathVariable Long versionNumber,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        Project project = projectService.getProjectByKey(projectKey);
        ProjectMembership membership = projectAccessService.checkAccessOfUserInProject(
                project, user, ProjectRole.VIEWER);
        TestCase testCase = testCaseService.findByProjectAndIdentifierNumber(membership.getProject(), testCaseIdentifier);
        TestCaseVersion testCaseVersion = testCaseVersionService.findByTestCaseAndVersionNumber(testCase, versionNumber);
        return ResponseEntity.ok(testCaseVersionMapper.toDto(testCaseVersion));
    }
}



