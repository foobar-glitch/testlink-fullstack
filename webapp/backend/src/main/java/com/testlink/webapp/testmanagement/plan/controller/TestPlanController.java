package com.testlink.webapp.testmanagement.plan.controller;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanDTO;
import com.testlink.webapp.testmanagement.plan.mapper.TestPlanMapper;
import com.testlink.webapp.testmanagement.plan.service.TestPlanService;
import com.testlink.webapp.testmanagement.testcase.service.ValidatePathService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/projects/project-key/{projectKey}/testplans")
@RequiredArgsConstructor
public class TestPlanController {
    private final ProjectService projectService;
    private final TestPlanService testPlanService;
    private final TestPlanMapper testPlanMapper;
    private final ValidatePathService validatePathService;


    @GetMapping("")
    public List<TestPlanDTO> testPlansOfProjects(@PathVariable String projectKey){
        Project project = projectService.getProjectByKey(projectKey);
        return testPlanMapper.toDtoList(testPlanService.findTestPlanOfProject(project));
    }

    @GetMapping("/{testPlanId}")
    public TestPlanDTO testPlanOfProjectOfId(@PathVariable String projectKey, @PathVariable Long testPlanId){
        ValidatePathService.ProjectTestPlan projectTestPlan = validatePathService.checkTestPlanPath(
                projectKey, testPlanId);
        return testPlanMapper.toDto(projectTestPlan.testPlan());
    }

}
