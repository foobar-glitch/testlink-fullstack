package com.testlink.webapp.testmanagement.plan.mapper;

import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunDTO;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRun;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {TestPlanMapper.class, IdMapper.class}
)
public abstract class TestPlanRunMapper extends BaseAuditMapper {
    @Mapping(target = "testPlanRunId", source = "publicId")
    @Mapping(target = "stamp", expression = "java(mapAudit(testPlan))")
    public abstract TestPlanRunDTO toDto(TestPlanRun testPlan);

    public abstract List<TestPlanRunDTO> toDtoList(List<TestPlanRun> testPlans);
}
