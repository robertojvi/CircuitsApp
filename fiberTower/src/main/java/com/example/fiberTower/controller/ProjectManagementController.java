package com.example.fiberTower.controller;

import com.example.fiberTower.model.*;
import com.example.fiberTower.security.JwtAuthenticationToken;
import com.example.fiberTower.service.IProjectManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/project-management")
@CrossOrigin(origins = {"http://localhost:5173", "http://192.168.68.111:5173"})
public class ProjectManagementController {

    @Autowired
    private IProjectManagementService projectManagementService;

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
            errorResponse.put("error", "Access denied. Only SUPER and ADMIN users can edit project management data.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }

        return null;
    }

    @GetMapping("/site/{siteId}")
    public ProjectDataDTO getProjectData(@PathVariable Long siteId) {
        return projectManagementService.getProjectData(siteId);
    }

    @PutMapping("/scope/{siteId}")
    public ResponseEntity<?> saveScopeOfWork(@PathVariable Long siteId, @RequestBody ProjectScopeOfWorkDTO dto) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        return ResponseEntity.ok(projectManagementService.saveScopeOfWork(siteId, dto));
    }

    @PutMapping("/timeline/{siteId}")
    public ResponseEntity<?> saveTimeline(@PathVariable Long siteId, @RequestBody ProjectTimelineDTO dto) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        return ResponseEntity.ok(projectManagementService.saveTimeline(siteId, dto));
    }

    @PostMapping("/delays/{siteId}")
    public ResponseEntity<?> addDelay(@PathVariable Long siteId, @RequestBody ProjectDelayDTO dto) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        return ResponseEntity.ok(projectManagementService.addDelay(siteId, dto));
    }

    @DeleteMapping("/delays/{delayId}")
    public ResponseEntity<?> deleteDelay(@PathVariable Long delayId) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        projectManagementService.deleteDelay(delayId);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @PutMapping("/workday-overrides/{siteId}")
    public ResponseEntity<?> saveWorkDayOverride(@PathVariable Long siteId, @RequestBody ProjectWorkDayOverrideDTO dto) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        return ResponseEntity.ok(projectManagementService.saveWorkDayOverride(siteId, dto));
    }

    @DeleteMapping("/workday-overrides/{id}")
    public ResponseEntity<?> deleteWorkDayOverride(@PathVariable Long id) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        projectManagementService.deleteWorkDayOverride(id);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @PutMapping("/progress/{siteId}")
    public ResponseEntity<?> saveProgressItems(@PathVariable Long siteId, @RequestBody List<ProjectProgressItemDTO> items) {
        ResponseEntity<?> accessError = requireEditAccess();
        if (accessError != null) {
            return accessError;
        }
        return ResponseEntity.ok(projectManagementService.saveProgressItems(siteId, items));
    }
}
