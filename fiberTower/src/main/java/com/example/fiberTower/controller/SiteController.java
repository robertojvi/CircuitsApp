package com.example.fiberTower.controller;

import com.example.fiberTower.model.SiteDTO;
import com.example.fiberTower.service.ISiteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping("/api/sites")
public class SiteController {
    @Autowired
    ISiteService siteService;

    @PostMapping
    public ResponseEntity<?> createSite(@RequestBody SiteDTO siteDTO) {
        siteService.createSite(siteDTO);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public SiteDTO getSiteById(@PathVariable Long id) {
        return siteService.getSiteById(id);
    }

    @PutMapping
    public ResponseEntity<?> updateSite(@RequestBody SiteDTO siteDTO) {
        siteService.updateSite(siteDTO);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSite(@PathVariable Long id) {
        siteService.deleteSite(id);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @GetMapping
    public Collection<SiteDTO> getAllSites() {
        return siteService.getAllSites();
    }
}
