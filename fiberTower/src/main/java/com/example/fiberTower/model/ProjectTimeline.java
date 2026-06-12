package com.example.fiberTower.model;

import jakarta.persistence.*;

@Entity
@Table(name = "project_timeline")
public class ProjectTimeline {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "site_id", nullable = false, unique = true)
    private Site site;

    private String constructionStartDate;
    private Integer workingDaysPerWeek;

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
