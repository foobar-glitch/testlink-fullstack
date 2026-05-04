package com.testlink.webapp.testmanagement.suite.controller;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.shared.util.IdUtil;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.service.TestPlanService;
import com.testlink.webapp.testmanagement.suite.dto.TestSuiteHierarchyDTO;
import com.testlink.webapp.testmanagement.suite.dto.TestSuiteItemDTO;
import com.testlink.webapp.testmanagement.suite.dto.TestSuitePlanStatsDTO;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.mapper.TestSuiteMapper;
import com.testlink.webapp.testmanagement.suite.mapper.TestSuitePlanStatsMapper;
import com.testlink.webapp.testmanagement.suite.service.TestSuiteHierarchyService;
import com.testlink.webapp.testmanagement.suite.service.TestSuiteService;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseDTO;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseMapper;
import com.testlink.webapp.testmanagement.testcase.service.TestCaseService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static com.testlink.webapp.shared.util.IdUtil.fromBase62;

@RestController
@RequestMapping("/test-suites")
@RequiredArgsConstructor
public class TestSuiteController {
    private final TestPlanService testPlanService;
    private final TestSuiteService testSuiteService;
    private final TestSuiteMapper testSuiteMapper;
    private final TestSuiteHierarchyService testSuiteHierarchyService;

    private final ProjectAccessService projectAccessService;
    private final ProjectService projectService;

    private final TestSuitePlanStatsMapper testSuiteStatsMapper;

    private final TestCaseService testCaseService;
    private final TestCaseMapper testCaseMapper;

    @GetMapping("/all")
    public ResponseEntity<List<TestSuiteHierarchyDTO>> getTestSuitesOfProductKey(
            @RequestParam String projectKey,
            @AuthenticationPrincipal CustomUserDetails customUserDetails){

        Project project = projectService.getProjectByKey(projectKey);

        projectAccessService.checkAccessOfUserInProject(
                projectKey, customUserDetails.getUser(), ProjectRole.VIEWER
        );

        List<TestSuiteHierarchyDTO> hierarchy =
                testSuiteHierarchyService.getFullHierarchy(project);

        return ResponseEntity.ok(hierarchy);
    }

    @GetMapping("")
    public ResponseEntity<List<TestSuiteHierarchyDTO>> getTestSuites(
            @RequestParam String projectKey,
            @RequestParam(required = false) String testPlan,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        Project project = projectService.getProjectByKey(projectKey);

        projectAccessService.checkAccessOfUserInProject(
                project, customUserDetails.getUser(), ProjectRole.VIEWER);

        List<TestSuiteHierarchyDTO> hierarchy;
        if (testPlan != null && !testPlan.isBlank()) {
            UUID planUuid = fromBase62(testPlan);
            hierarchy = testSuiteHierarchyService.getFilteredHierarchy(project, planUuid);
        } else {
            hierarchy = testSuiteHierarchyService.getFullHierarchy(project);
        }

        return ResponseEntity.ok(hierarchy);
    }


    @GetMapping("/view")
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

        List<TestSuiteHierarchyDTO> children = testSuiteService
                .findChildrenOfTestSuiteInProject(project, testSuite)
                .stream()
                .map(child -> TestSuiteHierarchyDTO.builder()
                        .current(testSuiteMapper.toDto(child))
                        .parent(testSuiteMapper.toDto(testSuite))
                        .children(Collections.emptyList())
                        .testCases(Collections.emptyList())
                        .build()
                )
                .toList();

        TestSuiteHierarchyDTO dto = TestSuiteHierarchyDTO.builder()
                .current(testSuiteMapper.toDto(testSuite))
                .parent(testSuite.getParentTestSuite() != null
                        ? testSuiteMapper.toDto(testSuite.getParentTestSuite())
                        : null)
                .children(children)
                .testCases(Collections.emptyList())
                .build();

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/view/stats/all")
    public ResponseEntity<TestSuitePlanStatsDTO> getTestSuiteStats(
            @RequestParam String projectKey,
            @RequestParam String suiteId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        Project project = projectService.getProjectByKey(projectKey);
        projectAccessService.checkAccessOfUserInProject(
                project, customUserDetails.getUser(), ProjectRole.VIEWER
        );
        TestSuite testSuite = testSuiteService.findBySuiteId(fromBase62(suiteId));

        return ResponseEntity.ok(
                testSuiteStatsMapper.toDto(testSuiteService.findTestSuiteStatsByTestSuite(testSuite))
        );
    }

    @GetMapping("/view/stats/testplan")
    public ResponseEntity<TestSuitePlanStatsDTO> getTestSuiteStatsOfTestPlan(
            @RequestParam String projectKey,
            @RequestParam String testPlanId,
            @RequestParam String suiteId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        Project project = projectService.getProjectByKey(projectKey);
        projectAccessService.checkAccessOfUserInProject(
                project, customUserDetails.getUser(), ProjectRole.VIEWER
        );
        //List<TestSuite> testSuite = testSuiteService.findBySuiteId(fromBase62(suiteId));
        TestPlan testPlan = testPlanService.findByTestPlanId(fromBase62(testPlanId), project);
        TestSuite testSuite = testSuiteService.findBySuiteId(fromBase62(suiteId));

        return ResponseEntity.ok(testSuiteStatsMapper.toDto(
                testSuiteService.findSuiteStatsByTestPlanAndSuite(testPlan, testSuite)));
    }

    @GetMapping("/view/stats/testplan/tree")
    public ResponseEntity<List<TestSuitePlanStatsDTO>> getTestSuiteStatsTree(
            @RequestParam String projectKey,
            @RequestParam String testPlanId,
            @RequestParam List<String> suiteIds,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        Project project = projectService.getProjectByKey(projectKey);
        projectAccessService.checkAccessOfUserInProject(
                project, customUserDetails.getUser(), ProjectRole.VIEWER
        );
        //List<TestSuite> testSuite = testSuiteService.findBySuiteId(fromBase62(suiteId));
        TestPlan testPlan = testPlanService.findByTestPlanId(fromBase62(testPlanId), project);
        List<TestSuite> testSuites = suiteIds.stream().map(IdUtil::fromBase62).map(testSuiteService::findBySuiteId).toList();


        return ResponseEntity.ok(
                testSuiteStatsMapper.toDtoList(testSuiteService.findSuiteStatsByTestPlanAndSuites(testPlan, testSuites))
        );
    }

    @GetMapping("/hierarchy")
    public ResponseEntity<TestSuiteHierarchyDTO> getSuiteHierarchy(
            @RequestParam String projectKey,
            @RequestParam String suiteId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        Project project = projectService.getProjectByKey(projectKey);
        projectAccessService.checkAccessOfUserInProject(
                project, customUserDetails.getUser(), ProjectRole.VIEWER);

        TestSuite testSuite = testSuiteService.findBySuiteId(fromBase62(suiteId));

        // Parent
        TestSuiteItemDTO parentDto = testSuite.getParentTestSuite() != null
                ? testSuiteMapper.toDto(testSuite.getParentTestSuite())
                : null;

        // Direct children
        List<TestSuiteHierarchyDTO> children = testSuiteService
                .findChildrenOfTestSuiteInProject(project, testSuite)
                .stream()
                .map(child -> TestSuiteHierarchyDTO.builder()
                        .current(testSuiteMapper.toDto(child))
                        .parent(testSuiteMapper.toDto(testSuite))   // parent of child is this suite
                        .children(Collections.emptyList())
                        .testCases(Collections.emptyList())
                        .build())
                .toList();

        // Test cases belonging directly to this suite
        List<TestCaseDTO> testCaseDtos = testCaseService
                .findAllTestCasesOfProjectAndSuite(project, testSuite)
                .stream()
                .map(testCaseMapper::toDto)
                .toList();

        TestSuiteHierarchyDTO dto = TestSuiteHierarchyDTO.builder()
                .current(testSuiteMapper.toDto(testSuite))
                .parent(parentDto)
                .children(children)
                .testCases(testCaseDtos)
                .build();

        return ResponseEntity.ok(dto);
    }

}