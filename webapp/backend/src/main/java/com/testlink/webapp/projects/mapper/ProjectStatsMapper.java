package com.testlink.webapp.projects.mapper;

import com.testlink.webapp.projects.dto.ProjectStatsDTO;
import com.testlink.webapp.projects.entity.ProjectStats;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class ProjectStatsMapper {

    public abstract ProjectStatsDTO toDto(ProjectStats stats);
    public abstract List<ProjectStatsDTO> toDtoList(List<ProjectStats> statsList);
}
