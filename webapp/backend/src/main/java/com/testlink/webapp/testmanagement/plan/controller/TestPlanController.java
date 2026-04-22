package com.testlink.webapp.testmanagement.plan.controller;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.entity.ProjectRole;
import com.testlink.webapp.projects.service.ProjectAccessService;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanDTO;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.mapper.TestPlanMapper;
import com.testlink.webapp.testmanagement.plan.service.TestPlanService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import com.testlink.webapp.user.entity.CustomUserDetails;
import com.testlink.webapp.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/testplans")
@RequiredArgsConstructor
public class TestPlanController {
    private final ProjectService projectService;
    private final TestPlanService testPlanService;
    private final TestPlanMapper testPlanMapper;
    private final ValidatePathService validatePathService;
    private final ProjectAccessService accessService;


    @GetMapping("")
    public ResponseEntity<List<TestPlanDTO>> testPlansOfProjects(
            @RequestParam String projectKey,
            @AuthenticationPrincipal CustomUserDetails userDetails){
        accessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        Project project = projectService.getProjectByKey(projectKey);
        return ResponseEntity.ok(testPlanMapper.toDtoList(testPlanService.findTestPlanOfProject(project)));
    }

    // api/testplans/testplan?testPlanId
    @GetMapping("/view")
    public ResponseEntity<TestPlanDTO> testPlanOfProjectOfId(
            @RequestParam String projectKey, @RequestParam String testPlanId, @AuthenticationPrincipal CustomUserDetails userDetails){
        accessService.checkAccessOfUserInProject(projectKey, userDetails.getUser(), ProjectRole.VIEWER);
        TestPlan testPlan = validatePathService.getTestPlan(testPlanId, projectKey);
        return ResponseEntity.ok(testPlanMapper.toDto(testPlan));
    }

}
