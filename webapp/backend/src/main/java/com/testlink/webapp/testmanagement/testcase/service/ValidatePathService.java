package com.testlink.webapp.testmanagement.testcase.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.projects.service.ProjectService;
import com.testlink.webapp.shared.exception.BadRequestException;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import com.testlink.webapp.testmanagement.plan.service.TestPlanRunItemService;
import com.testlink.webapp.testmanagement.plan.service.TestPlanRunService;
import com.testlink.webapp.testmanagement.plan.service.TestPlanService;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.suite.service.TestSuiteService;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ValidatePathService {
    private final ProjectService projectService;
    private final TestSuiteService testSuiteService;
    private final TestCaseService testCaseService;
    private final TestCaseVersionService testCaseVersionService;
    private final TestPlanService testPlanService;
    private final TestPlanRunService testPlanRunService;
    private final TestPlanRunItemService testPlanRunItemService;

    public ProjectTestSuite checkTestSuitePath(String projectKey, Long suiteId){
        Project project = projectService.getProjectByKey(projectKey);
        TestSuite testSuite = testSuiteService.findBySuiteId(suiteId);
        if(!project.equals(testSuite.getProject())){
            throw new BadRequestException(String.format("SuiteId %d not in ProjectKey %s", suiteId, projectKey));
        }
        return ProjectTestSuite.builder().project(project).testSuite(testSuite).build();
    }

    public ProjectTestSuiteTestCase checkTestSuitePath(String projectKey, Long suiteId, Long testCaseIdentifier){
        ProjectTestSuite data = this.checkTestSuitePath(projectKey, suiteId);
        TestCase testCase = testCaseService.findByProjectAndIdentifierNumber(data.project(), testCaseIdentifier);
        if(!data.testSuite().equals(testCase.getTestSuite())){
            throw new BadRequestException(String.format("TestCase %d not in SuiteId %d", testCaseIdentifier, suiteId));
        }
        return ProjectTestSuiteTestCase.builder().project(data.project()).testSuite(data.testSuite()).testCase(testCase).build();
    }

    //@RequestMapping("/projects/project-key/{projectKey}/suite/{suiteId}/testcase-identifier/{testCaseIdentifier}/versions/{versionId}")
    public ProjectTestSuiteTestCaseTestVersion checkTestSuitePath(String projectKey, Long suiteId, Long testCaseIdentifier, Long versionId){
        ProjectTestSuiteTestCase data = this.checkTestSuitePath(projectKey, suiteId, testCaseIdentifier);

        TestCaseVersion testCaseVersion = testCaseVersionService.findByTestCaseAndVersionNumber(
                data.testCase(), versionId
        );
        if(!data.testCase().equals(testCaseVersion.getTestCase())){
            throw new BadRequestException(String.format("Version %d not in TestCase %d", versionId, testCaseIdentifier));
        }
        return ProjectTestSuiteTestCaseTestVersion.builder()
                .project(data.project())
                .testSuite(data.testSuite())
                .testCase(data.testCase())
                .testCaseVersion(testCaseVersion)
                .build();
    }

    public ProjectTestPlan checkTestPlanPath(String projectKey, Long testPlanId){
        Project project = projectService.getProjectByKey(projectKey);
        TestPlan testPlan = testPlanService.findByTestPlanId(testPlanId);
        if(!project.equals(testPlan.getProject())){
            throw new BadRequestException(String.format("TestPlan %d not in Project %s", testPlanId, projectKey));
        }
        return ProjectTestPlan.builder().project(project).testPlan(testPlan).build();
    }

    public ProjectTestPlanTestPlanRun checkTestPlanPath(String projectKey, Long testPlanId, Long testRunId){
        ProjectTestPlan data = this.checkTestPlanPath(projectKey, testPlanId);
        TestPlanRun testPlanRun = testPlanRunService.findByTestRunId(testRunId);
        if(!data.testPlan().equals(testPlanRun.getTestPlan())){
            throw new BadRequestException(String.format("TestPlan %d not in Project %s", testRunId, testPlanId));
        }
        return ProjectTestPlanTestPlanRun.builder()
                .project(data.project())
                .testPlan(data.testPlan())
                .testPlanRun(testPlanRun).build();
    }

    public ProjectTestPlanTestPlanRunItem checkTestPlanPath(String projectKey, Long testPlanId, Long testRunId, Long testRunItemId){
        ProjectTestPlanTestPlanRun data = this.checkTestPlanPath(projectKey, testPlanId, testRunId);
        TestPlanRunItem testPlanRunItem = testPlanRunItemService.findByTestPlanRunItemId(testRunItemId);

        if(!data.testPlanRun().equals(testPlanRunItem.getTestPlanRun())){
            throw new BadRequestException(String.format("TestPlan %d not in Project %s", testRunId, testPlanId));
        }
        return ProjectTestPlanTestPlanRunItem.builder()
                .project(data.project())
                .testPlan(data.testPlan())
                .testPlanRun(data.testPlanRun())
                .testPlanRunItem(testPlanRunItem)
                .build();
    }



    @Builder
    public record ProjectTestSuite(Project project, TestSuite testSuite){}
    @Builder
    public record ProjectTestSuiteTestCase(Project project, TestSuite testSuite, TestCase testCase){}
    @Builder
    public record ProjectTestSuiteTestCaseTestVersion(Project project, TestSuite testSuite, TestCase testCase, TestCaseVersion testCaseVersion){}

    @Builder
    public record ProjectTestPlan(Project project, TestPlan testPlan){}
    @Builder
    public record ProjectTestPlanTestPlanRun(Project project, TestPlan testPlan, TestPlanRun testPlanRun){}
    @Builder
    public record ProjectTestPlanTestPlanRunItem(Project project, TestPlan testPlan, TestPlanRun testPlanRun, TestPlanRunItem testPlanRunItem){}

}
