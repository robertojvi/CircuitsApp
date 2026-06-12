package com.example.fiberTower.model;

public class ProjectTimelineDTO {

    private Long id;
    private Long siteId;
    private String constructionStartDate;
    private Integer workingDaysPerWeek;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSiteId() {
        return siteId;
    }

    public void setSiteId(Long siteId) {
        this.siteId = siteId;
    }

    public String getConstructionStartDate() {
        return constructionStartDate;
    }

    public void setConstructionStartDate(String constructionStartDate) {
        this.constructionStartDate = constructionStartDate;
    }

    public Integer getWorkingDaysPerWeek() {
        return workingDaysPerWeek;
    }

    public void setWorkingDaysPerWeek(Integer workingDaysPerWeek) {
        this.workingDaysPerWeek = workingDaysPerWeek;
    }
}
