package com.example.fiberTower.controller;

import com.example.fiberTower.model.ProviderDTO;
import com.example.fiberTower.service.IProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {
    @Autowired
    IProviderService providerService;

    @PostMapping
    public ResponseEntity<?> createProvider(@RequestBody ProviderDTO providerDTO) {
        providerService.createProvider(providerDTO);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ProviderDTO getProviderById(@PathVariable Long id) {
        return providerService.getProviderById(id);
    }

    @PutMapping
    public ResponseEntity<?> updateProvider(@RequestBody ProviderDTO providerDTO) {
        providerService.updateProvider(providerDTO);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProvider(@PathVariable Long id) {
        providerService.deleteProvider(id);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @GetMapping
    public Collection<ProviderDTO> getAllProviders() {
        return providerService.getAllProviders();
    }
}
