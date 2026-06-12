package com.example.fiberTower.service;

import com.example.fiberTower.model.ProjectUpdateDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IProjectUpdateService {
    List<ProjectUpdateDTO> getUpdatesBySite(Long siteId);

    ProjectUpdateDTO createUpdate(Long siteId, String updateDate, String text, MultipartFile[] images) throws IOException;

    ProjectUpdateDTO updateUpdate(Long id, String updateDate, String text, MultipartFile[] newImages) throws IOException;

    void deleteUpdate(Long id) throws IOException;

    void deleteImage(Long imageId) throws IOException;
}
