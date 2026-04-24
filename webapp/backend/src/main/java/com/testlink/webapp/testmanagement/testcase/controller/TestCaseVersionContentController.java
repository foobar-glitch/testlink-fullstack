package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionContentDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionContent;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseVersionContentMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseVersionContentService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test-case-version-content")
@RequiredArgsConstructor
public class TestCaseVersionContentController {
    private final TestCaseVersionContentService testCaseVersionContentService;
    private final ValidatePathService validatePathService;
    private final TestCaseVersionContentMapper testCaseVersionContentMapper;
    private final ProjectAccessService projectAccessService;

    @GetMapping("")
    public ResponseEntity<TestCaseVersionContentDTO> getVersions(
            @RequestParam String projectKey,
            @RequestParam Long testCaseIdentifier,
            @RequestParam Long version,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        projectAccessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        TestCaseVersion testCaseVersion = validatePathService.getTestCaseVersion(
                projectKey, testCaseIdentifier, version);
        TestCaseVersionContent testCaseVersionContent = testCaseVersionContentService.findContentOfTestCaseVersion(
                testCaseVersion);

        return ResponseEntity.ok(testCaseVersionContentMapper.toDto(testCaseVersionContent));
    }

}
