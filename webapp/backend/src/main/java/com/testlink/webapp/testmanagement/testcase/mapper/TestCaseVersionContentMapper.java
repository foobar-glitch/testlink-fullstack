package com.testlink.webapp.testmanagement.testcase.mapper;

import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionContentDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionContent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {TestCaseVersionMapper.class}
)
public interface TestCaseVersionContentMapper extends BaseAuditMapper {
    @Mapping(target = "stamp", expression = "java(mapAudit(testCaseVersionContent))")
    TestCaseVersionContentDTO toDto(TestCaseVersionContent testCaseVersionContent);
    List<TestCaseVersionContentDTO> toDtoList(List<TestCaseVersionContent> testCaseVersions);
}