package com.testlink.webapp.testmanagement.plan.mapper;

import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanStatsDTO;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanStats;
import org.mapstruct.Mapper;

import java.util.List;


@Mapper(componentModel = "spring", uses = { IdMapper.class })
public interface TestPlanStatsMapper {
    TestPlanStatsDTO toDto(TestPlanStats stats);
    List<TestPlanStatsDTO> toDtoList(List<TestPlanStats> statsList);
}