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
public abstract class TestCaseVersionContentMapper extends BaseAuditMapper {
    @Mapping(target = "testCaseVersionId", source = "testCaseVersionId")
    @Mapping(target = "testCaseVersion", source = "testCaseVersion")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "preconditions", source = "preconditions")
    @Mapping(target = "expectedResult", source = "expectedResult")
    @Mapping(target = "stamp", expression = "java(mapAudit(testCaseVersionContent))")
    public abstract TestCaseVersionContentDTO toDto(TestCaseVersionContent testCaseVersionContent);
    public abstract List<TestCaseVersionContentDTO> toDtoList(List<TestCaseVersionContent> testCaseVersions);
}