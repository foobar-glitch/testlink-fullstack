package com.testlink.webapp.testmanagement.testcase.mapper;

import com.testlink.webapp.testmanagement.testcase.dto.TestCaseStatsDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseStats;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class TestCaseStatsMapper {
    public abstract TestCaseStatsDTO toDto(TestCaseStats stats);
    public abstract List<TestCaseStatsDTO> toDtoList(List<TestCaseStats> statsList);
}
