package com.testlink.webapp.testmanagement.plan.mapper;

import com.testlink.webapp.shared.mapper.BaseAuditMapper;
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
                UserMapper.class                  // for User -> UserSummaryDTO
        }
)
public abstract class TestPlanRunItemMapper extends BaseAuditMapper {

    @Mapping(target = "testRunItemId", source = "testRunItemId")
    @Mapping(target = "testRun", source = "testRun")
    @Mapping(target = "testCase", source = "testCase")
    @Mapping(target = "testCaseVersion", source = "testCaseVersion")
    @Mapping(target = "assignedTo", source = "assignedTo")
    @Mapping(target = "executedBy", source = "executedBy")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "executedAt", source = "executedAt")
    @Mapping(target = "notes", source = "notes")
    @Mapping(target = "stamp", expression = "java(mapAudit(testPlanRunItem))")
    public abstract TestPlanRunItemDTO toDto(TestPlanRunItem testPlanRunItem);

    public abstract List<TestPlanRunItemDTO> toDtoList(List<TestPlanRunItem> items);
}