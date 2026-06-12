package com.example.fiberTower.service;

import com.example.fiberTower.model.*;

import java.util.List;

public interface IProjectManagementService {
    ProjectDataDTO getProjectData(Long siteId);

    ProjectScopeOfWorkDTO saveScopeOfWork(Long siteId, ProjectScopeOfWorkDTO dto);

    ProjectTimelineDTO saveTimeline(Long siteId, ProjectTimelineDTO dto);

    ProjectDelayDTO addDelay(Long siteId, ProjectDelayDTO dto);

    void deleteDelay(Long delayId);

    ProjectWorkDayOverrideDTO saveWorkDayOverride(Long siteId, ProjectWorkDayOverrideDTO dto);

    void deleteWorkDayOverride(Long id);

    List<ProjectProgressItemDTO> saveProgressItems(Long siteId, List<ProjectProgressItemDTO> dtos);
}
