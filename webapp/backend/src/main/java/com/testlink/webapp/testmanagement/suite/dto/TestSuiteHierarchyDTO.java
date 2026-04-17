package com.testlink.webapp.testmanagement.suite.dto;

public record TestSuiteHierarchyDTO(
        TestSuiteItemDTO current,
        TestSuiteItemDTO parent)
{ }
