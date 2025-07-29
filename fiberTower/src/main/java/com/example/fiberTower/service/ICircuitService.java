package com.example.fiberTower.service;

import com.example.fiberTower.model.CircuitDTO;

import java.util.Set;

public interface ICircuitService {
    void createCircuit(CircuitDTO circuitDTO);
    CircuitDTO getCircuitById(Long id);
    void updateCircuit(CircuitDTO circuitDTO);
    void deleteCircuit(Long id);
    Set<CircuitDTO> getAllCircuits();
}
