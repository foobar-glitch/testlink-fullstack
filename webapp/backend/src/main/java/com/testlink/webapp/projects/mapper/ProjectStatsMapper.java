package com.testlink.webapp.projects.mapper;

import com.testlink.webapp.projects.dto.ProjectStatsDTO;
import com.testlink.webapp.projects.entity.ProjectStats;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProjectStatsMapper {
    ProjectStatsDTO toDto(ProjectStats stats);
    List<ProjectStatsDTO> toDtoList(List<ProjectStats> statsList);
}
