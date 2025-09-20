package com.example.fiberTower.service;

import com.example.fiberTower.model.Site;
import com.example.fiberTower.model.SiteDTO;
import com.example.fiberTower.repository.ISiteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class SiteService implements ISiteService {

    @Autowired
    private ISiteRepository siteRepository;

    @Autowired
    ObjectMapper mapper;

    private void saveSite(SiteDTO siteDTO){
        Site site = mapper.convertValue(siteDTO, Site.class);
        siteRepository.save(site);
    }

    @Override
    public void createSite(SiteDTO siteDTO) {
        saveSite(siteDTO);
    }

    @Override
    public SiteDTO getSiteById(Long id) {
        Optional<Site> site = siteRepository.findById(id);
        SiteDTO siteDTO = null;
        if (site.isPresent())
            siteDTO = mapper.convertValue(site, SiteDTO.class);
        return siteDTO;
    }

    @Override
    public void updateSite(SiteDTO siteDTO) {
        saveSite(siteDTO);
    }

    @Override
    public void deleteSite(Long id) {
        siteRepository.deleteById(id);
    }

    @Override
    public Set<SiteDTO> getAllSites() {
        List<Site> sites = siteRepository.findAll();
        Set<SiteDTO> sitesDTO = new HashSet<>();
        for (Site site : sites) {
            sitesDTO.add(mapper.convertValue(site, SiteDTO.class));
        }
        return sitesDTO;
    }
}
