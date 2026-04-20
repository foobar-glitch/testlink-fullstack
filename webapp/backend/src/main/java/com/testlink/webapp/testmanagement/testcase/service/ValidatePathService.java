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
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import com.testlink.webapp.testmanagement.testcase.entity.TestStepResult;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static com.testlink.webapp.shared.util.IdUtil.fromBase62;

@Service
@RequiredArgsConstructor
public class ValidatePathService {
    private final ProjectService projectService;
    private final TestSuiteService testSuiteService;
    private final TestCaseService testCaseService;
    private final TestCaseVersionService testCaseVersionService;
    private final TestCaseVersionStepService testCaseVersionStepService;
    private final TestStepResultService testStepResultService;

    private final TestPlanService testPlanService;
    private final TestPlanRunService testPlanRunService;
    private final TestPlanRunItemService testPlanRunItemService;

    public ProjectTestSuite checkTestSuitePath(String projectKey, String suiteId){
        Project project = projectService.getProjectByKey(projectKey);
        TestSuite testSuite = testSuiteService.findBySuiteId(fromBase62(suiteId));
        if(!project.equals(testSuite.getProject())){
            throw new BadRequestException(String.format("SuiteId %s not in ProjectKey %s", suiteId, projectKey));
        }
        return ProjectTestSuite.builder().project(project).testSuite(testSuite).build();
    }

    public ProjectTestSuiteTestCase checkTestSuitePath(String projectKey, String suiteId, Long testCaseIdentifier){
        ProjectTestSuite data = this.checkTestSuitePath(projectKey, suiteId);
        TestCase testCase = testCaseService.findByProjectAndIdentifierNumber(data.project(), testCaseIdentifier);
        if(!data.testSuite().equals(testCase.getTestSuite())){
            throw new BadRequestException(String.format("TestCase %d not in SuiteId %s", testCaseIdentifier, suiteId));
        }
        return ProjectTestSuiteTestCase.builder().project(data.project()).testSuite(data.testSuite()).testCase(testCase).build();
    }

    //@RequestMapping("/projects/project-key/{projectKey}/suite/{suiteId}/testcase-identifier/{testCaseIdentifier}/versions/{versionId}")
    public ProjectTestSuiteTestCaseTestVersion checkTestSuitePath(String projectKey, String suiteId, Long testCaseIdentifier, Long versionId){
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

    public ProjectTestSuiteTestCaseTestVersionTestStep checkTestSuitePath(String projectKey, String suiteId, Long testCaseIdentifier, Long versionId, String stepId){
        ProjectTestSuiteTestCaseTestVersion data = this.checkTestSuitePath(projectKey, suiteId, testCaseIdentifier, versionId);
        TestCaseVersionStep testCaseVersionStep = testCaseVersionStepService.findTestCaseVersionByPublicId(fromBase62(stepId));
        if(!data.testCaseVersion().equals(testCaseVersionStep.getTestCaseVersion())){
            throw new BadRequestException(String.format("StepId %s not in TestCaseVersion %d", stepId, versionId));
        }
        return ProjectTestSuiteTestCaseTestVersionTestStep.builder()
                .project(data.project())
                .testSuite(data.testSuite())
                .testCase(data.testCase())
                .testCaseVersion(data.testCaseVersion())
                .testCaseVersionStep(testCaseVersionStep)
                .build();
    }

    public ProjectTestSuiteTestCaseTestVersionTestStepResult checkTestSuitePath(String projectKey, String suiteId, Long testCaseIdentifier, Long versionId, String stepId, String actionId){
        ProjectTestSuiteTestCaseTestVersionTestStep data = this.checkTestSuitePath(projectKey, suiteId, testCaseIdentifier, versionId, stepId);
        TestStepResult testStepResult = testStepResultService.findTestStepResultsByPublicId(fromBase62(actionId));
        if(!data.testCaseVersionStep().equals(testStepResult.getTestCaseVersionStep())){
            throw new BadRequestException(String.format("actionId %s not in TestStepResultId %s", actionId, stepId));
        }
        return ProjectTestSuiteTestCaseTestVersionTestStepResult.builder()
                .project(data.project())
                .testSuite(data.testSuite())
                .testCase(data.testCase())
                .testCaseVersion(data.testCaseVersion())
                .testCaseVersionStep(data.testCaseVersionStep())
                .testStepResult(testStepResult)
                .build();
    }

    public ProjectTestPlan checkTestPlanPath(String projectKey, String testPlanId){
        Project project = projectService.getProjectByKey(projectKey);
        TestPlan testPlan = testPlanService.findByTestPlanId(fromBase62(testPlanId));
        if(!project.equals(testPlan.getProject())){
            throw new BadRequestException(String.format("TestPlan %s not in Project %s", testPlanId, projectKey));
        }
        return ProjectTestPlan.builder().project(project).testPlan(testPlan).build();
    }

    public ProjectTestPlanTestPlanRun checkTestPlanPath(String projectKey, String testPlanId, String testRunId){
        ProjectTestPlan data = this.checkTestPlanPath(projectKey, testPlanId);
        TestPlanRun testPlanRun = testPlanRunService.findByTestRunId(fromBase62(testRunId));
        if(!data.testPlan().equals(testPlanRun.getTestPlan())){
            throw new BadRequestException(String.format("TestPlan %s not in Project %s", testRunId, testPlanId));
        }
        return ProjectTestPlanTestPlanRun.builder()
                .project(data.project())
                .testPlan(data.testPlan())
                .testPlanRun(testPlanRun).build();
    }

    public ProjectTestPlanTestPlanRunItem checkTestPlanPath(String projectKey, String testPlanId, String testRunId, String testRunItemId){
        ProjectTestPlanTestPlanRun data = this.checkTestPlanPath(projectKey, testPlanId, testRunId);
        TestPlanRunItem testPlanRunItem = testPlanRunItemService.findByTestPlanRunItemId(fromBase62(testRunItemId));

        if(!data.testPlanRun().equals(testPlanRunItem.getTestPlanRun())){
            throw new BadRequestException(String.format("TestPlan %s not in Project %s", testRunId, testPlanId));
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
    public record ProjectTestSuiteTestCaseTestVersion(
            Project project, TestSuite testSuite, TestCase testCase, TestCaseVersion testCaseVersion){}
    @Builder
    public  record ProjectTestSuiteTestCaseTestVersionTestStep(
            Project project, TestSuite testSuite, TestCase testCase, TestCaseVersion testCaseVersion,
            TestCaseVersionStep testCaseVersionStep){}

    @Builder
    public record  ProjectTestSuiteTestCaseTestVersionTestStepResult(
            Project project, TestSuite testSuite, TestCase testCase, TestCaseVersion testCaseVersion,
            TestCaseVersionStep testCaseVersionStep, TestStepResult testStepResult
    ){}

    @Builder
    public record ProjectTestPlan(Project project, TestPlan testPlan){}
    @Builder
    public record ProjectTestPlanTestPlanRun(Project project, TestPlan testPlan, TestPlanRun testPlanRun){}
    @Builder
    public record ProjectTestPlanTestPlanRunItem(Project project, TestPlan testPlan, TestPlanRun testPlanRun, TestPlanRunItem testPlanRunItem){}

}
