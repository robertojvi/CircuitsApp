package com.example.fiberTower.service;

import com.example.fiberTower.model.ProviderDTO;

import java.util.Set;

public interface IProviderService {

    void createProvider(ProviderDTO providerDTO);
    ProviderDTO getProviderById(Long id);
    void updateProvider(ProviderDTO providerDTO);
    void deleteProvider(Long id);
    Set<ProviderDTO> getAllProviders();
}
