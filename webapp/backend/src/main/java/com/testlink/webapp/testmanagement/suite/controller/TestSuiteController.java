package com.testlink.webapp.testmanagement.suite.controller;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectMembership;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.testmanagement.suite.dto.TestSuiteHierarchyDTO;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.mapper.TestSuiteMapper;
import com.testlink.webapp.testmanagement.suite.service.TestSuiteService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

import static com.testlink.webapp.shared.util.IdUtil.fromBase62;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class TestSuiteController {
    private final TestSuiteService testSuiteService;
    private final TestSuiteMapper testSuiteMapper;
    private final ProjectAccessService projectAccessService;
    private final ProjectService projectService;

    @GetMapping("/project-key/{projectKey}/suites")
    public ResponseEntity<List<TestSuiteHierarchyDTO>> getTestSuitesOfProductKey(@PathVariable String projectKey, @AuthenticationPrincipal CustomUserDetails customUserDetails){
        Project project = projectService.getProjectByKey(projectKey);
        ProjectMembership projectMembership =  projectAccessService.checkAccessOfUserInProject(
                project, customUserDetails.getUser(), ProjectRole.VIEWER
        );

        List<TestSuite> rootTree = testSuiteService.findProjectTestSuiteRootTree(projectMembership.getProject());
        List<TestSuiteHierarchyDTO> hierarchyDTO = new ArrayList<>();

        for(TestSuite item: rootTree){
            TestSuiteHierarchyDTO itemHierarchyDTO = TestSuiteHierarchyDTO.builder()
                    .current(testSuiteMapper.toDto(item))
                    .parent(null)
                    .children(testSuiteMapper.toDtoList(
                            testSuiteService.findChildrenOfTestSuiteInProject(projectMembership.getProject(), item)))
                    .build();
            hierarchyDTO.add(itemHierarchyDTO);
        }

        return ResponseEntity.ok(hierarchyDTO);

    }


    @GetMapping("/project-key/{projectKey}/suites/{suiteId}")
    public ResponseEntity<TestSuiteHierarchyDTO> getTestSuite(
            @PathVariable String projectKey,
            @PathVariable String suiteId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        Project project = projectService.getProjectByKey(projectKey);
        ProjectMembership projectMembership =  projectAccessService.checkAccessOfUserInProject(
                project, customUserDetails.getUser(), ProjectRole.VIEWER
        );
        TestSuite testSuite = testSuiteService.findBySuiteId(fromBase62(suiteId));
        TestSuiteHierarchyDTO hierarchyDTO = TestSuiteHierarchyDTO.builder()
                .current(testSuiteMapper.toDto(testSuite))
                .parent(testSuiteMapper.toDto(testSuite.getParentTestSuite()))
                .children(testSuiteMapper.toDtoList(
                        testSuiteService.findChildrenOfTestSuiteInProject(projectMembership.getProject(), testSuite))
                )
                .build();
        return ResponseEntity.ok(hierarchyDTO);
    }

}