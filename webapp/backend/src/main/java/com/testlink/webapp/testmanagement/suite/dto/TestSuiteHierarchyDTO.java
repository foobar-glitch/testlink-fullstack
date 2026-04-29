package com.testlink.webapp.testmanagement.suite.dto;

import com.testlink.webapp.testmanagement.testcase.dto.TestCaseDTO;
import lombok.Builder;

import java.util.List;

@Builder
public record TestSuiteHierarchyDTO(
        TestSuiteItemDTO current,
        TestSuiteItemDTO parent,
        List<TestSuiteHierarchyDTO> children,
        List<TestCaseDTO> testCases
) {}