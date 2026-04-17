package com.testlink.webapp.testmanagement.suite.controller;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.testmanagement.suite.dto.TestSuiteHierarchyDTO;
import com.testlink.webapp.testmanagement.suite.dto.TestSuiteItemDTO;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.mapper.TestSuiteMapper;
import com.testlink.webapp.testmanagement.suite.service.TestSuiteService;
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
public class TestSuiteController {

    private final ProjectService projectService;
    private final TestSuiteService testSuiteService;
    private final TestSuiteMapper testSuiteMapper;

    @GetMapping("/{projectId}/suites")
    public ResponseEntity<List<TestSuiteItemDTO>> getTestSuites(
            @PathVariable Long projectId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        AccessContext ctx = buildContext(projectId, customUserDetails);

        List<TestSuite> rootTree =
                testSuiteService.findProjectTestSuiteRootTree(ctx.project());

        return ResponseEntity.ok(
                testSuiteMapper.toDtoList(rootTree)
        );
    }

    @GetMapping("/{projectId}/suites/{suiteId}")
    public ResponseEntity<TestSuiteHierarchyDTO> getTestSuite(
            @PathVariable Long projectId,
            @PathVariable Long suiteId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        AccessContext ctx = buildContext(projectId, customUserDetails);

        TestSuite testSuite = testSuiteService.findBySuiteId(suiteId);

        TestSuiteHierarchyDTO hierarchyDTO =
                new TestSuiteHierarchyDTO(
                        testSuiteMapper.toDto(testSuite),
                        testSuiteMapper.toDto(testSuite.getParentTestSuite())
                );

        return ResponseEntity.ok(hierarchyDTO);
    }

    @GetMapping("/{projectId}/suites/{suiteId}/children")
    public ResponseEntity<List<TestSuiteItemDTO>> getChildSuites(
            @PathVariable Long projectId,
            @PathVariable Long suiteId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        AccessContext ctx = buildContext(projectId, customUserDetails);

        TestSuite testSuite = testSuiteService.findBySuiteId(suiteId);

        List<TestSuite> children =
                testSuiteService.findChildrenOfTestSuiteInProject(ctx.project(), testSuite);

        return ResponseEntity.ok(
                testSuiteMapper.toDtoList(children)
        );
    }

    private AccessContext buildContext(Long projectId, CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        Project project = projectService.getProjectById(projectId);

        projectService.verifyMemberShipRights(
                project,
                user,
                ProjectRole.VIEWER
        );

        return new AccessContext(user, project);
    }

    // simple internal helper record
    private record AccessContext(User user, Project project) {}
}