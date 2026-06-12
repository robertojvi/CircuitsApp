package com.example.fiberTower.model;

import jakarta.persistence.*;

@Entity
@Table(name = "project_workday_override")
public class ProjectWorkDayOverride {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    private String date;
    private Boolean isWorkDay;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
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
