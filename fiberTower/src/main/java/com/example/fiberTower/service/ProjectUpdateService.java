package com.example.fiberTower.service;

import com.example.fiberTower.model.*;
import com.example.fiberTower.repository.IProjectUpdateImageRepository;
import com.example.fiberTower.repository.IProjectUpdateRepository;
import com.example.fiberTower.repository.ISiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProjectUpdateService implements IProjectUpdateService {

    @Autowired
    private IProjectUpdateRepository projectUpdateRepository;

    @Autowired
    private IProjectUpdateImageRepository projectUpdateImageRepository;

    @Autowired
    private ISiteRepository siteRepository;

    @Value("${upload.dir}")
    private String uploadDir;

    @Override
    public List<ProjectUpdateDTO> getUpdatesBySite(Long siteId) {
        List<ProjectUpdateDTO> result = new ArrayList<>();
        for (ProjectUpdate update : projectUpdateRepository.findBySiteIdOrderByUpdateDateDescIdDesc(siteId)) {
            result.add(toDTO(update));
        }
        return result;
    }

    @Override
    public ProjectUpdateDTO createUpdate(Long siteId, String updateDate, String text, MultipartFile[] images) throws IOException {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));

        ProjectUpdate update = new ProjectUpdate();
        update.setSite(site);
        update.setUpdateDate(updateDate);
        update.setText(text);
        update.setCreatedAt(LocalDateTime.now().toString());

        if (images != null) {
            for (MultipartFile image : images) {
                if (image == null || image.isEmpty()) {
                    continue;
                }
                ProjectUpdateImage imageEntity = saveImageFile(siteId, image);
                imageEntity.setProjectUpdate(update);
                update.getImages().add(imageEntity);
            }
        }

        return toDTO(projectUpdateRepository.save(update));
    }

    @Override
    public ProjectUpdateDTO updateUpdate(Long id, String updateDate, String text, MultipartFile[] newImages) throws IOException {
        ProjectUpdate update = projectUpdateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project update not found: " + id));

        if (updateDate != null) {
            update.setUpdateDate(updateDate);
        }
        if (text != null) {
            update.setText(text);
        }

        if (newImages != null) {
            for (MultipartFile image : newImages) {
                if (image == null || image.isEmpty()) {
                    continue;
                }
                ProjectUpdateImage imageEntity = saveImageFile(update.getSite().getId(), image);
                imageEntity.setProjectUpdate(update);
                update.getImages().add(imageEntity);
            }
        }

        return toDTO(projectUpdateRepository.save(update));
    }

    @Override
    public void deleteUpdate(Long id) throws IOException {
        ProjectUpdate update = projectUpdateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project update not found: " + id));

        for (ProjectUpdateImage image : update.getImages()) {
            deleteImageFile(image.getImageUrl());
        }

        projectUpdateRepository.delete(update);
    }

    @Override
    public void deleteImage(Long imageId) throws IOException {
        ProjectUpdateImage image = projectUpdateImageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("Image not found: " + imageId));

        ProjectUpdate update = image.getProjectUpdate();
        update.getImages().remove(image);

        deleteImageFile(image.getImageUrl());

        projectUpdateRepository.save(update);
    }

    private ProjectUpdateImage saveImageFile(Long siteId, MultipartFile file) throws IOException {
        String rawFileName = file.getOriginalFilename();
        String originalFileName = rawFileName == null ? "image" : rawFileName;
        String sanitizedFileName = originalFileName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storedFileName = UUID.randomUUID() + "_" + sanitizedFileName;

        Path directory = Paths.get(uploadDir, "project-updates", String.valueOf(siteId));
        Files.createDirectories(directory);

        Path destination = directory.resolve(storedFileName);
        file.transferTo(destination);

        ProjectUpdateImage image = new ProjectUpdateImage();
        image.setFileName(originalFileName);
        image.setImageUrl("/uploads/project-updates/" + siteId + "/" + storedFileName);
        return image;
    }

    private void deleteImageFile(String imageUrl) throws IOException {
        if (imageUrl == null || !imageUrl.startsWith("/uploads/")) {
            return;
        }
        Path filePath = Paths.get(uploadDir, imageUrl.substring("/uploads/".length()));
        Files.deleteIfExists(filePath);
    }

    private ProjectUpdateDTO toDTO(ProjectUpdate entity) {
        ProjectUpdateDTO dto = new ProjectUpdateDTO();
        dto.setId(entity.getId());
        dto.setSiteId(entity.getSite().getId());
        dto.setUpdateDate(entity.getUpdateDate());
        dto.setText(entity.getText());
        dto.setCreatedAt(entity.getCreatedAt());

        List<ProjectUpdateImageDTO> images = new ArrayList<>();
        for (ProjectUpdateImage image : entity.getImages()) {
            ProjectUpdateImageDTO imageDTO = new ProjectUpdateImageDTO();
            imageDTO.setId(image.getId());
            imageDTO.setImageUrl(image.getImageUrl());
            imageDTO.setFileName(image.getFileName());
            images.add(imageDTO);
        }
        dto.setImages(images);

        return dto;
    }
}
