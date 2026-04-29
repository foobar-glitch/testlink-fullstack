package com.testlink.webapp.testmanagement.testcase.mapper;


import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.suite.mapper.TestSuiteMapper;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {TestSuiteMapper.class, IdMapper.class}
)
public interface TestCaseMapper extends BaseAuditMapper {
    @Mapping(target = "testCaseId", source = "publicId")
    @Mapping(target = "stamp", expression = "java(mapAudit(testCase))")
    TestCaseDTO toDto(TestCase testCase);
    List<TestCaseDTO> toDtoList(List<TestCase> testCases);
}