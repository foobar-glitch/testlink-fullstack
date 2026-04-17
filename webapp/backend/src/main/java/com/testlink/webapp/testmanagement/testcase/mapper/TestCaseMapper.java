package com.testlink.webapp.testmanagement.testcase.mapper;

import com.testlink.webapp.testmanagement.suite.mapper.TestSuiteMapper;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {TestSuiteMapper.class}
)
public abstract class TestCaseMapper {

    @Mapping(target = "testCaseId", source = "testCaseId")
    @Mapping(target = "project", source = "project")
    @Mapping(target = "testSuite", source = "testSuite")
    @Mapping(target = "identifierNumber", source = "identifierNumber")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "stamp", expression = "java(mapAudit(testCase))")
    public abstract TestCaseDTO toDto(TestCase testCase);

    public abstract List<TestCaseDTO> toDtoList(List<TestCase> testCases);
}
