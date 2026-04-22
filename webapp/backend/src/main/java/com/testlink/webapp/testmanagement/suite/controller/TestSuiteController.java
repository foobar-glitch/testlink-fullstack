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
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("")
    public ResponseEntity<List<TestSuiteHierarchyDTO>> getTestSuitesOfProductKey(
            @RequestParam String projectKey, @AuthenticationPrincipal CustomUserDetails customUserDetails){
        Project project = projectService.getProjectByKey(projectKey);
        projectAccessService.checkAccessOfUserInProject(
                project, customUserDetails.getUser(), ProjectRole.VIEWER
        );

        List<TestSuite> rootTree = testSuiteService.findProjectTestSuiteRootTree(project);
        List<TestSuiteHierarchyDTO> hierarchyDTO = new ArrayList<>();

        for(TestSuite item: rootTree){
            TestSuiteHierarchyDTO itemHierarchyDTO = TestSuiteHierarchyDTO.builder()
                    .current(testSuiteMapper.toDto(item))
                    .parent(null)
                    .children(testSuiteMapper.toDtoList(
                            testSuiteService.findChildrenOfTestSuiteInProject(project, item)))
                    .build();
            hierarchyDTO.add(itemHierarchyDTO);
        }

        return ResponseEntity.ok(hierarchyDTO);

    }


    @GetMapping("/suites")
    public ResponseEntity<TestSuiteHierarchyDTO> getTestSuite(
            @RequestParam String projectKey,
            @RequestParam String suiteId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        Project project = projectService.getProjectByKey(projectKey);
        projectAccessService.checkAccessOfUserInProject(
                project, customUserDetails.getUser(), ProjectRole.VIEWER
        );
        TestSuite testSuite = testSuiteService.findBySuiteId(fromBase62(suiteId));
        TestSuiteHierarchyDTO hierarchyDTO = TestSuiteHierarchyDTO.builder()
                .current(testSuiteMapper.toDto(testSuite))
                .parent(testSuiteMapper.toDto(testSuite.getParentTestSuite()))
                .children(testSuiteMapper.toDtoList(
                        testSuiteService.findChildrenOfTestSuiteInProject(project, testSuite))
                )
                .build();
        return ResponseEntity.ok(hierarchyDTO);
    }

}