package com.testlink.webapp.testmanagement.testcase.mapper;

import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {TestCaseMapper.class}
)
public interface TestCaseVersionMapper {
    @Mapping(target = "testCaseVersionId", source = "testCaseVersionId")
    @Mapping(target = "testCase", source = "testCase")
    @Mapping(target = "versionNumber", source = "versionNumber")
    @Mapping(target = "status", source = "status")
    TestCaseVersionDTO toDto(TestCaseVersion testCaseVersion);

    List<TestCaseVersionDTO> toDtoList(List<TestCaseVersion> testCaseVersions);
}