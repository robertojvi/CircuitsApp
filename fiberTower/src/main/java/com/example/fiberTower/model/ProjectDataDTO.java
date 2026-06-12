package com.example.fiberTower.model;

import java.util.List;

public class ProjectDataDTO {

    private ProjectScopeOfWorkDTO scopeOfWork;
    private ProjectTimelineDTO timeline;
    private List<ProjectDelayDTO> delays;
    private List<ProjectWorkDayOverrideDTO> workDayOverrides;
    private List<ProjectProgressItemDTO> progressItems;

    public ProjectScopeOfWorkDTO getScopeOfWork() {
        return scopeOfWork;
    }

    public void setScopeOfWork(ProjectScopeOfWorkDTO scopeOfWork) {
        this.scopeOfWork = scopeOfWork;
    }

    public ProjectTimelineDTO getTimeline() {
        return timeline;
    }

    public void setTimeline(ProjectTimelineDTO timeline) {
        this.timeline = timeline;
    }

    public List<ProjectDelayDTO> getDelays() {
        return delays;
    }

    public void setDelays(List<ProjectDelayDTO> delays) {
        this.delays = delays;
    }

    public List<ProjectWorkDayOverrideDTO> getWorkDayOverrides() {
        return workDayOverrides;
    }

    public void setWorkDayOverrides(List<ProjectWorkDayOverrideDTO> workDayOverrides) {
        this.workDayOverrides = workDayOverrides;
    }

    public List<ProjectProgressItemDTO> getProgressItems() {
        return progressItems;
    }

    public void setProgressItems(List<ProjectProgressItemDTO> progressItems) {
        this.progressItems = progressItems;
    }
}
