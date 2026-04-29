package com.testlink.webapp.testmanagement.testcase.mapper;

import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.plan.mapper.TestPlanRunItemMapper;
import com.testlink.webapp.testmanagement.testcase.dto.TestStepResultDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestStepResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;


@Mapper(
        componentModel = "spring",
        uses = {TestPlanRunItemMapper.class, TestCaseVersionStepMapper.class,
                IdMapper.class}
)
public interface TestStepResultMapper extends BaseAuditMapper {
    @Mapping(target = "testStepResultId", source = "publicId")
    @Mapping(target = "stamp", expression = "java(mapAudit(testStepResult))")
    TestStepResultDTO toDto(TestStepResult testStepResult);
    List<TestStepResultDTO> toDtoList(List<TestStepResult> testCaseVersionSteps);
}
