package com.example.fiberTower.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_update")
public class ProjectUpdate {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    private String updateDate;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String text;

    private String createdAt;

    @OneToMany(mappedBy = "projectUpdate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectUpdateImage> images = new ArrayList<>();

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

    public List<ProjectUpdateImage> getImages() {
        return images;
    }

    public void setImages(List<ProjectUpdateImage> images) {
        this.images = images;
    }
}
