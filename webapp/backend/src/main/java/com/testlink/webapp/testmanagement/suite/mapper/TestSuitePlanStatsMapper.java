package com.testlink.webapp.testmanagement.suite.mapper;

import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.suite.dto.TestSuitePlanStatsDTO;
import com.testlink.webapp.testmanagement.suite.entity.TestSuitePlanStats;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = { IdMapper.class })
public interface TestSuitePlanStatsMapper {

    @Mapping(source = "id.testSuiteId", target = "testSuiteId")
    @Mapping(source = "id.testPlanId", target = "testPlanId")
    TestSuitePlanStatsDTO toDto(TestSuitePlanStats stats);

    List<TestSuitePlanStatsDTO> toDtoList(List<TestSuitePlanStats> statsList);
}