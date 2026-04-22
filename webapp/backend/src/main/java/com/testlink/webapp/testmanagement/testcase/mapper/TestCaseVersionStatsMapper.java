package com.testlink.webapp.testmanagement.testcase.mapper;

import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.testmanagement.testcase.dto.TestCaseVersionStatsDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCaseVersionStats;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class TestCaseVersionStatsMapper {

    public abstract TestCaseVersionStatsDTO toDto(TestCaseVersionStats stats);

    public abstract List<TestCaseVersionStatsDTO> toDtoList(List<TestCaseVersionStats> statsList);
}