package com.testlink.webapp.testmanagement.plan.mapper;

import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.shared.mapper.IdMapper;
import com.testlink.webapp.testmanagement.plan.dto.TestPlanRunItemDTO;
import com.testlink.webapp.testmanagement.plan.entity.TestPlanRunItem;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseMapper;
import com.testlink.webapp.testmanagement.testcase.mapper.TestCaseVersionMapper;
import com.testlink.webapp.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                TestPlanRunMapper.class,
                TestCaseMapper.class,
                TestCaseVersionMapper.class,
                UserMapper.class,
                IdMapper.class
        }
)
public abstract class TestPlanRunItemMapper extends BaseAuditMapper {

    @Mapping(target = "testRunItemId", source = "publicId")
    @Mapping(target = "stamp", expression = "java(mapAudit(testPlanRunItem))")
    public abstract TestPlanRunItemDTO toDto(TestPlanRunItem testPlanRunItem);

    public abstract List<TestPlanRunItemDTO> toDtoList(List<TestPlanRunItem> items);
}