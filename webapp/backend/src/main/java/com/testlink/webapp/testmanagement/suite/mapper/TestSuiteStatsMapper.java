package com.testlink.webapp.testmanagement.suite.mapper;

import com.testlink.webapp.testmanagement.suite.dto.TestSuiteStatsDTO;
import com.testlink.webapp.testmanagement.suite.entity.TestSuiteStats;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class TestSuiteStatsMapper {
    public abstract TestSuiteStatsDTO toDto(TestSuiteStats stats);

    public abstract List<TestSuiteStatsDTO> toDtoList(List<TestSuiteStats> statsList);
}
