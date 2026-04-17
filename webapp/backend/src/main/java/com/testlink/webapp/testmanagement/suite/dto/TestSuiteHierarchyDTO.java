package com.testlink.webapp.testmanagement.suite.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record TestSuiteHierarchyDTO(
        TestSuiteItemDTO current,
        TestSuiteItemDTO parent,
        List<TestSuiteItemDTO> children
        )
{}
