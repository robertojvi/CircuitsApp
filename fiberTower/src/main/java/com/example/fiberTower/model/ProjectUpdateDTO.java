package com.example.fiberTower.model;

import java.util.List;

public class ProjectUpdateDTO {

    private Long id;
    private Long siteId;
    private String updateDate;
    private String text;
    private String createdAt;
    private List<ProjectUpdateImageDTO> images;

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

    public String getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(String updateDate) {
        this.updateDate = updateDate;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public List<ProjectUpdateImageDTO> getImages() {
        return images;
    }

    public void setImages(List<ProjectUpdateImageDTO> images) {
        this.images = images;
    }
}
