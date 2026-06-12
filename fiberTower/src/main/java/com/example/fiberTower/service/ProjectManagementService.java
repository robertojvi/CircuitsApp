package com.example.fiberTower.service;

import com.example.fiberTower.model.*;
import com.example.fiberTower.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectManagementService implements IProjectManagementService {

    private static final String[] CATEGORY_KEYS = {
            "headend", "bnOrDn", "pointToPoint", "outdoorIndoorAp", "cnOrRn",
            "directBurialPolesElectrical", "poleTestTurnUp", "directBurialFiber", "conduit",
            "fiberPull", "breakerDisconnects", "cameras", "nemaElectrical", "homeInstalls"
    };

    @Autowired
    private IProjectScopeOfWorkRepository scopeOfWorkRepository;

    @Autowired
    private IProjectTimelineRepository timelineRepository;

    @Autowired
    private IProjectDelayRepository delayRepository;

    @Autowired
    private IProjectWorkDayOverrideRepository workDayOverrideRepository;

    @Autowired
    private IProjectProgressItemRepository progressItemRepository;

    @Autowired
    private ISiteRepository siteRepository;

    @Autowired
    private ObjectMapper mapper;

    @Override
    public ProjectDataDTO getProjectData(Long siteId) {
        ProjectDataDTO data = new ProjectDataDTO();

        scopeOfWorkRepository.findBySiteId(siteId)
                .ifPresent(entity -> data.setScopeOfWork(toScopeOfWorkDTO(entity)));

        timelineRepository.findBySiteId(siteId)
                .ifPresent(entity -> data.setTimeline(toTimelineDTO(entity)));

        List<ProjectDelayDTO> delays = new ArrayList<>();
        for (ProjectDelay delay : delayRepository.findBySiteIdOrderByDateRecordedAsc(siteId)) {
            delays.add(toDelayDTO(delay));
        }
        data.setDelays(delays);

        List<ProjectWorkDayOverrideDTO> overrides = new ArrayList<>();
        for (ProjectWorkDayOverride override : workDayOverrideRepository.findBySiteId(siteId)) {
            overrides.add(toWorkDayOverrideDTO(override));
        }
        data.setWorkDayOverrides(overrides);

        List<ProjectProgressItemDTO> progressItems = new ArrayList<>();
        for (ProjectProgressItem item : progressItemRepository.findBySiteId(siteId)) {
            progressItems.add(toProgressItemDTO(item));
        }
        data.setProgressItems(progressItems);

        return data;
    }

    @Override
    public ProjectScopeOfWorkDTO saveScopeOfWork(Long siteId, ProjectScopeOfWorkDTO dto) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));

        ProjectScopeOfWork entity = mapper.convertValue(dto, ProjectScopeOfWork.class);
        entity.setSite(site);

        Optional<ProjectScopeOfWork> existing = scopeOfWorkRepository.findBySiteId(siteId);
        existing.ifPresent(value -> entity.setId(value.getId()));

        ProjectScopeOfWork saved = scopeOfWorkRepository.save(entity);

        syncProgressItems(site, saved);

        return toScopeOfWorkDTO(saved);
    }

    @Override
    public ProjectTimelineDTO saveTimeline(Long siteId, ProjectTimelineDTO dto) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));

        ProjectTimeline entity = mapper.convertValue(dto, ProjectTimeline.class);
        entity.setSite(site);

        Optional<ProjectTimeline> existing = timelineRepository.findBySiteId(siteId);
        existing.ifPresent(value -> entity.setId(value.getId()));

        ProjectTimeline saved = timelineRepository.save(entity);
        return toTimelineDTO(saved);
    }

    @Override
    public ProjectDelayDTO addDelay(Long siteId, ProjectDelayDTO dto) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));

        ProjectDelay entity = mapper.convertValue(dto, ProjectDelay.class);
        entity.setId(null);
        entity.setSite(site);

        ProjectDelay saved = delayRepository.save(entity);
        return toDelayDTO(saved);
    }

    @Override
    public void deleteDelay(Long delayId) {
        delayRepository.deleteById(delayId);
    }

    @Override
    public ProjectWorkDayOverrideDTO saveWorkDayOverride(Long siteId, ProjectWorkDayOverrideDTO dto) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));

        ProjectWorkDayOverride entity = mapper.convertValue(dto, ProjectWorkDayOverride.class);
        entity.setSite(site);

        Optional<ProjectWorkDayOverride> existing =
                workDayOverrideRepository.findBySiteIdAndDate(siteId, dto.getDate());
        existing.ifPresent(value -> entity.setId(value.getId()));

        ProjectWorkDayOverride saved = workDayOverrideRepository.save(entity);
        return toWorkDayOverrideDTO(saved);
    }

    @Override
    public void deleteWorkDayOverride(Long id) {
        workDayOverrideRepository.deleteById(id);
    }

    @Override
    public List<ProjectProgressItemDTO> saveProgressItems(Long siteId, List<ProjectProgressItemDTO> dtos) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));

        List<ProjectProgressItemDTO> result = new ArrayList<>();
        for (ProjectProgressItemDTO dto : dtos) {
            ProjectProgressItem entity = progressItemRepository
                    .findBySiteIdAndCategory(siteId, dto.getCategory())
                    .orElseGet(ProjectProgressItem::new);

            entity.setSite(site);
            entity.setCategory(dto.getCategory());
            entity.setStatus(dto.getStatus());
            entity.setPercentComplete(dto.getPercentComplete());

            result.add(toProgressItemDTO(progressItemRepository.save(entity)));
        }
        return result;
    }

    private void syncProgressItems(Site site, ProjectScopeOfWork scope) {
        for (String category : CATEGORY_KEYS) {
            Double quantity = getQuantityForCategory(scope, category);
            if (quantity == null || quantity <= 0) {
                continue;
            }

            Optional<ProjectProgressItem> existing =
                    progressItemRepository.findBySiteIdAndCategory(site.getId(), category);
            if (existing.isEmpty()) {
                ProjectProgressItem item = new ProjectProgressItem();
                item.setSite(site);
                item.setCategory(category);
                item.setStatus("PENDING");
                item.setPercentComplete(0.0);
                progressItemRepository.save(item);
            }
        }
    }

    private Double getQuantityForCategory(ProjectScopeOfWork scope, String category) {
        switch (category) {
            case "headend": return scope.getHeadendQuantity();
            case "bnOrDn": return scope.getBnOrDnQuantity();
            case "pointToPoint": return scope.getPointToPointQuantity();
            case "outdoorIndoorAp": return scope.getOutdoorIndoorApQuantity();
            case "cnOrRn": return scope.getCnOrRnQuantity();
            case "directBurialPolesElectrical": return scope.getDirectBurialPolesElectricalQuantity();
            case "poleTestTurnUp": return scope.getPoleTestTurnUpQuantity();
            case "directBurialFiber": return scope.getDirectBurialFiberQuantity();
            case "conduit": return scope.getConduitQuantity();
            case "fiberPull": return scope.getFiberPullQuantity();
            case "breakerDisconnects": return scope.getBreakerDisconnectsQuantity();
            case "cameras": return scope.getCamerasQuantity();
            case "nemaElectrical": return scope.getNemaElectricalQuantity();
            case "homeInstalls": return scope.getHomeInstallsQuantity();
            default: return null;
        }
    }

    private ProjectScopeOfWorkDTO toScopeOfWorkDTO(ProjectScopeOfWork entity) {
        ProjectScopeOfWorkDTO dto = mapper.convertValue(entity, ProjectScopeOfWorkDTO.class);
        dto.setSiteId(entity.getSite().getId());
        return dto;
    }

    private ProjectTimelineDTO toTimelineDTO(ProjectTimeline entity) {
        ProjectTimelineDTO dto = mapper.convertValue(entity, ProjectTimelineDTO.class);
        dto.setSiteId(entity.getSite().getId());
        return dto;
    }

    private ProjectDelayDTO toDelayDTO(ProjectDelay entity) {
        ProjectDelayDTO dto = mapper.convertValue(entity, ProjectDelayDTO.class);
        dto.setSiteId(entity.getSite().getId());
        return dto;
    }

    private ProjectWorkDayOverrideDTO toWorkDayOverrideDTO(ProjectWorkDayOverride entity) {
        ProjectWorkDayOverrideDTO dto = mapper.convertValue(entity, ProjectWorkDayOverrideDTO.class);
        dto.setSiteId(entity.getSite().getId());
        return dto;
    }

    private ProjectProgressItemDTO toProgressItemDTO(ProjectProgressItem entity) {
        ProjectProgressItemDTO dto = mapper.convertValue(entity, ProjectProgressItemDTO.class);
        dto.setSiteId(entity.getSite().getId());
        return dto;
    }
}
