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
public interface TestCaseVersionMapper extends BaseAuditMapper {
    @Mapping(target = "testCaseVersionId", source = "publicId")
    @Mapping(target = "stamp", expression = "java(mapAudit(testCaseVersion))")

    TestCaseVersionDTO toDto(TestCaseVersion testCaseVersion);
    List<TestCaseVersionDTO> toDtoList(List<TestCaseVersion> testCaseVersions);
}