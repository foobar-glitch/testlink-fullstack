package com.testlink.webapp.testmanagement.testcase.mapper;

import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionStepDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStep;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {TestCaseVersionMapper.class, IdMapper.class}
)
public interface TestCaseVersionStepMapper extends BaseAuditMapper {
    @Mapping(target = "stepId", source = "publicId")
    @Mapping(target = "stamp", expression = "java(mapAudit(testCaseVersionStep))")
    TestCaseVersionStepDTO toDto(TestCaseVersionStep testCaseVersionStep);
    List<TestCaseVersionStepDTO> toDtoList(List<TestCaseVersionStep> testCaseVersionSteps);
}
