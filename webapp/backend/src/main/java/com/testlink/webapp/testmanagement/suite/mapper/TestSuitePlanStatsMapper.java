package com.testlink.webapp.testmanagement.suite.mapper;

import com.testlink.webapp.testmanagement.suite.dto.TestSuiteStatsDTO;
import com.testlink.webapp.testmanagement.suite.entity.TestSuitePlanStats;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TestSuitePlanStatsMapper {

    @Mapping(source = "id.testSuiteId", target = "testSuiteId")
    @Mapping(source = "id.testPlanId", target = "planId")
    TestSuiteStatsDTO toDto(TestSuitePlanStats stats);

    List<TestSuiteStatsDTO> toDtoList(List<TestSuitePlanStats> statsList);
}