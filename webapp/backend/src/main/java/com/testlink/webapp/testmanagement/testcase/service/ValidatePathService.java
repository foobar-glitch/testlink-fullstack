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

    private Project getP(String projectKey){
        return projectService.getProjectByKey(projectKey);
    }

    public TestSuite getTestSuite(String projectKey, String suiteId){
        Project project = projectService.getProjectByKey(projectKey);
        TestSuite testSuite = testSuiteService.findBySuiteId(fromBase62(suiteId));
        if(!project.equals(testSuite.getProject())){
            throw new BadRequestException(String.format("SuiteId %s not in ProjectKey %s", suiteId, projectKey));
        }
        return testSuite;
    }

    public TestCase getTestCase(String projectKey, Long testCaseIdentifier){
        Project project = projectService.getProjectByKey(projectKey);
        return testCaseService.findByProjectAndIdentifierNumber(project, testCaseIdentifier);
    }

    //@RequestMapping("/projects/project-key/{projectKey}/suite/{suiteId}/testcase-identifier/{testCaseIdentifier}/versions/{versionId}")
    public TestCaseVersion getTestCaseVersion(String projectKey, Long testCaseIdentifier, Long versionId){
        TestCase testCase = this.getTestCase(projectKey, testCaseIdentifier);
        return testCaseVersionService.findByTestCaseAndVersionNumber(
                testCase, versionId
        );
    }


    public TestCaseVersionStep getTestCaseVersionStep(String stepId, String projectKey){
        return testCaseVersionStepService.findTestCaseVersionByPublicIdAndProject(fromBase62(stepId), getP(projectKey));
    }

    public TestStepResult getTestStepResult(String actionId, String projectKey){
        return testStepResultService.findTestStepResultsByPublicIdAndProject(fromBase62(actionId), getP(projectKey));
    }

    public TestPlan getTestPlan(String testPlanId, String projectKey){
        return testPlanService.findByTestPlanId(fromBase62(testPlanId), getP(projectKey));
    }

    public TestPlanRun getTestPlanRun(String testRunId, String projectKey){
        return testPlanRunService.findByTestRunId(fromBase62(testRunId), getP(projectKey));
    }

    public TestPlanRunItem getTestPlanRunItemByItemId(String testRunItemId, String projectKey){
        return testPlanRunItemService.findByTestPlanRunItemId(fromBase62(testRunItemId), getP(projectKey));
    }

}
