package com.testlink.webapp.testmanagement.testcase.mapper;

import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {TestCaseMapper.class, IdMapper.class}
)
public abstract class TestCaseVersionMapper extends BaseAuditMapper {
    @Mapping(target = "testCaseVersionId", source = "publicId")
    @Mapping(target = "testCase", source = "testCase")
    @Mapping(target = "versionNumber", source = "versionNumber")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "stamp", expression = "java(mapAudit(testCaseVersion))")
    public abstract TestCaseVersionDTO toDto(TestCaseVersion testCaseVersion);
    public abstract List<TestCaseVersionDTO> toDtoList(List<TestCaseVersion> testCaseVersions);
}