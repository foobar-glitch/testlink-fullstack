package com.testlink.webapp.testmanagement.suite.mapper;

import com.testlink.webapp.projects.mapper.ProjectMapper;
import com.testlink.webapp.shared.mapper.BaseAuditMapper;
import com.testlink.webapp.testmanagement.suite.dto.TestSuiteItemDTO;
import com.testlink.webapp.testmanagement.suite.entity.TestSuite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {ProjectMapper.class} // reuse your existing mapper
)
public abstract class TestSuiteMapper extends BaseAuditMapper {

    @Mapping(target = "testSuiteId", source = "testSuiteId")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "project", source = "project")
    @Mapping(target = "stamp", expression = "java(mapAudit(testSuite))")
    public abstract TestSuiteItemDTO toDto(TestSuite testSuite);

    public abstract List<TestSuiteItemDTO> toDtoList(List<TestSuite> testSuites);
}