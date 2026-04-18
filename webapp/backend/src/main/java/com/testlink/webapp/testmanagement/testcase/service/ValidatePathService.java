package com.testlink.webapp.testmanagement.testcase.service;

import com.testlink.webapp.projects.entity.Project;
import com.testlink.webapp.shared.exception.BadRequestException;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ValidatePathService {
    public void checkSuiteInProject(TestSuite suite, Project project){
        if(!suite.getProject().getProjectKey().equals(project.getProjectKey())){
            throw new BadRequestException(String.format("SuiteId %s does not exist in Project %s", suite.getName(), project.getProjectKey()));
        }
    }

    public void checkTestCaseInSuite(TestCase testCase, TestSuite suite){
        if(!suite.equals(testCase.getTestSuite())){
            throw new BadRequestException(String.format("Testcase %d does not exist in TestSuite %s", testCase.getIdentifierNumber(), suite.getName()));
        }
    }

}
