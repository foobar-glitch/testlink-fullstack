package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.shared.exception.BadRequestException;
import com.testlink.webapp.testmanagement.suite.service.TestSuiteService;
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
@RequestMapping("/projects/{projectId}")
@RequiredArgsConstructor
public class TestCaseVersionController {

    private final TestCaseService testCaseService;
    private final TestCaseVersionService testCaseVersionService;
    private final TestCaseVersionMapper testCaseVersionMapper;
    private final ProjectAccessService projectAccessService;

    @GetMapping("/testcases/{testCaseId}/versions")
    public ResponseEntity<List<TestCaseVersionDTO>> getVersions(
            @PathVariable Long projectId,
            @PathVariable Long testCaseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        ProjectMembership membership = projectAccessService.checkAccessOfUserInProject(
                projectId, user, ProjectRole.VIEWER);

        TestCase testCase = testCaseService.findById(testCaseId);

        List<TestCaseVersion> versions = testCaseVersionService.getVersionsForTestCase(testCase);
        return ResponseEntity.ok(testCaseVersionMapper.toDtoList(versions));
    }

    @GetMapping("versions/{versionId}")
    public ResponseEntity<TestCaseVersionDTO> getVersion(
            @PathVariable Long projectId,
            @PathVariable Long versionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        projectAccessService.checkAccessOfUserInProject(projectId, user, ProjectRole.VIEWER);

        TestCaseVersion version = testCaseVersionService.getVersionById(versionId);
        return ResponseEntity.ok(testCaseVersionMapper.toDto(version));
    }
}