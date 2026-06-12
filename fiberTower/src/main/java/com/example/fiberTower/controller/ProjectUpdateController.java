package com.example.fiberTower.controller;

import com.example.fiberTower.security.JwtAuthenticationToken;
import com.example.fiberTower.service.IProjectUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/project-updates")
@CrossOrigin(origins = {"http://localhost:5173", "http://192.168.68.111:5173"})
public class ProjectUpdateController {

    @Autowired
    private IProjectUpdateService projectUpdateService;

    private ResponseEntity<?> requireEditAccess() {
        JwtAuthenticationToken authentication =
                (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        String role = authentication.getRole();
        if (!role.equals("SUPER") && !role.equals("ADMIN")) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Access denied. Only SUPER and ADMIN users can edit project updates.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }

        return null;
    }

    @GetMapping("/site/{siteId}")
    public ResponseEntity<?> getUpdatesBySite(@PathVariable Long siteId) {
        return ResponseEntity.ok(projectUpdateService.getUpdatesBySite(siteId));
    }

    @PostMapping
    public ResponseEntity<?> createUpdate(
            @RequestParam("siteId") Long siteId,
            @RequestParam("updateDate") String updateDate,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        try {
            return ResponseEntity.ok(projectUpdateService.createUpdate(siteId, updateDate, text, images));
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUpdate(
            @PathVariable Long id,
            @RequestParam(value = "updateDate", required = false) String updateDate,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "images", required = false) MultipartFile[] newImages) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        try {
            return ResponseEntity.ok(projectUpdateService.updateUpdate(id, updateDate, text, newImages));
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUpdate(@PathVariable Long id) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        try {
            projectUpdateService.deleteUpdate(id);
            return ResponseEntity.ok(HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/image/{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable Long imageId) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        try {
            projectUpdateService.deleteImage(imageId);
            return ResponseEntity.ok(HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
