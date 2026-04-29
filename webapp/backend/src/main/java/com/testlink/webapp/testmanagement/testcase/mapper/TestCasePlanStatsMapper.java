package com.testlink.webapp.testmanagement.testcase.mapper;

import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.testcase.dto.TestCasePlanStatsDTO;
import com.testlink.webapp.testmanagement.testcase.entity.TestCasePlanStats;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = { IdMapper.class })
public interface TestCasePlanStatsMapper {
    @Mapping(source = "id.testCaseId", target = "testCaseId")
    @Mapping(source = "id.testPlanId", target = "testPlanId")
    TestCasePlanStatsDTO toDto(TestCasePlanStats stats);

    List<TestCasePlanStatsDTO> toDtoList(List<TestCasePlanStats> statsList);
}
