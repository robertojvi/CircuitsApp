package com.example.fiberTower.service;

import com.example.fiberTower.model.SiteDTO;

import java.util.Set;

public interface ISiteService {

    void createSite(SiteDTO siteDTO);
    SiteDTO getSiteById(Long id);
    void updateSite(SiteDTO siteDTO);
    void deleteSite(Long id);
    Set<SiteDTO> getAllSites();
}
