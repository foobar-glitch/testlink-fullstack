package com.testlink.webapp.testmanagement.testcase.mapper;

import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionPlanStatsDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionPlanStats;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = { IdMapper.class })
public interface TestCaseVersionPlanStatsMapper {
    @Mapping(source = "id.testCaseVersionId", target = "testCaseVersionId")
    @Mapping(source = "id.testPlanId", target = "testPlanId")
    TestCaseVersionPlanStatsDTO toDto(TestCaseVersionPlanStats stats);
    List<TestCaseVersionPlanStatsDTO> toDtoList(List<TestCaseVersionPlanStats> statsList);
}