package com.example.fiberTower.service;

import com.example.fiberTower.model.Provider;
import com.example.fiberTower.model.ProviderDTO;
import com.example.fiberTower.repository.IProviderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ProviderService implements IProviderService{
    @Autowired
    private IProviderRepository providerRepository;

    @Autowired
    private ObjectMapper mapper;

    private void saveProvider(ProviderDTO providerDTO){
        Provider provider = mapper.convertValue(providerDTO, Provider.class);
        providerRepository.save(provider);
    }

    @Override
    public void createProvider(ProviderDTO providerDTO) {
        saveProvider(providerDTO);
    }

    @Override
    public ProviderDTO getProviderById(Long id) {
        Optional<Provider> provider = providerRepository.findById(id);
        ProviderDTO providerDTO = null;
        if (provider.isPresent())
            providerDTO = mapper.convertValue(provider, ProviderDTO.class);
        return providerDTO;
    }

    @Override
    public void updateProvider(ProviderDTO providerDTO) {
        saveProvider(providerDTO);
    }

    @Override
    public void deleteProvider(Long id) {
        providerRepository.deleteById(id);
    }

    @Override
    public Set<ProviderDTO> getAllProviders() {
        List<Provider> providers = providerRepository.findAll();
        Set<ProviderDTO> providersDTO = new HashSet<>();
        for (Provider provider : providers) {
            providersDTO.add(mapper.convertValue(provider, ProviderDTO.class));
        }
        return providersDTO;
    }
}
