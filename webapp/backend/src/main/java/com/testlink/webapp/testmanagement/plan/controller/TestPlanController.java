package com.testlink.webapp.testmanagement.plan.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/projects/project-key/{projectKey}/suite/{suiteId}/testcase-identifier/{testCaseIdentifier}/versions/{versionId}")
@RequiredArgsConstructor
public class TestPlanController {
}
