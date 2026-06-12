package com.example.fiberTower.model;

public class ProjectWorkDayOverrideDTO {

    private Long id;
    private Long siteId;
    private String date;
    private Boolean isWorkDay;

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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Boolean getIsWorkDay() {
        return isWorkDay;
    }

    public void setIsWorkDay(Boolean isWorkDay) {
        this.isWorkDay = isWorkDay;
    }
}
