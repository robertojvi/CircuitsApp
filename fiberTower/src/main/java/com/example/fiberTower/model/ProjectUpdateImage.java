package com.example.fiberTower.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "project_update_image")
public class ProjectUpdateImage {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_update_id", nullable = false)
    @JsonIgnore
    private ProjectUpdate projectUpdate;

    private String imageUrl;
    private String fileName;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ProjectUpdate getProjectUpdate() {
        return projectUpdate;
    }

    public void setProjectUpdate(ProjectUpdate projectUpdate) {
        this.projectUpdate = projectUpdate;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}
