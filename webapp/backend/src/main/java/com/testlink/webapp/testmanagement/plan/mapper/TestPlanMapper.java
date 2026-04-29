package com.testlink.webapp.testmanagement.plan.mapper;

import com.testlink.webapp.projects.mapper.ProjectMapper;
import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanDTO;
import com.testlink.webapp.testmanagement.plan.entity.TestPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {ProjectMapper.class, IdMapper.class}
)
public abstract class TestPlanMapper extends BaseAuditMapper {
    @Mapping(target = "testPlanId", source = "publicId")
    @Mapping(target = "stamp", expression = "java(mapAudit(testPlan))")
    public abstract TestPlanDTO toDto(TestPlan testPlan);

    public abstract List<TestPlanDTO> toDtoList(List<TestPlan> testPlans);
}
