package com.testlink.webapp.testmanagement.plan.mapper;

import com.testlink.webapp.testmanagement.plan.dto.TestPlanStatsDTO;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanStats;
import org.mapstruct.Mapper;

import java.util.List;


@Mapper(componentModel = "spring")
public abstract class TestPlanStatsMapper {
    public abstract TestPlanStatsDTO toDto(TestPlanStats stats);
    public abstract List<TestPlanStatsDTO> toDtoList(List<TestPlanStats> statsList);
}