package com.testlink.webapp.testmanagement.testcase.controller;

import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionContentDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionContent;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseVersionContentMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseVersionContentService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/projects/project-key/{projectKey}/suite/{suiteId}/testcase-identifier/{testCaseIdentifier}/versions/{version}/content")
@RequiredArgsConstructor
public class TestCaseVersionContentController {
    private final TestCaseVersionContentService testCaseVersionContentService;
    private final ValidatePathService validatePathService;
    private final TestCaseVersionContentMapper testCaseVersionContentMapper;
    private final ProjectAccessService projectAccessService;

    @GetMapping("")
    public ResponseEntity<TestCaseVersionContentDTO> getVersions(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @PathVariable Long testCaseIdentifier,
            @PathVariable Long version,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ValidatePathService.ProjectTestSuiteTestCaseTestVersion data = validatePathService.checkTestSuitePath(
                projectKey, suiteId, testCaseIdentifier, version);
        TestCaseVersionContent testCaseVersionContent = testCaseVersionContentService.findContentOfTestCaseVersion(
                data.testCaseVersion());
        projectAccessService.checkAccessOfUserInProject(data.project(), userDetails.getUser(), ProjectRole.VIEWER);
        return ResponseEntity.ok(testCaseVersionContentMapper.toDto(testCaseVersionContent));
    }

}
