package com.example.fiberTower.service;

import com.example.fiberTower.model.Circuit;
import com.example.fiberTower.model.CircuitDTO;
import com.example.fiberTower.repository.ICircuitRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class CircuitService implements ICircuitService{
    @Autowired
    private ICircuitRepository circuitRepository;

    @Autowired
    private ObjectMapper mapper;

    private void saveCircuit(CircuitDTO circuitDTO) {
        Circuit circuit = mapper.convertValue(circuitDTO, Circuit.class);
        circuitRepository.save(circuit);
    }

    @Override
    public void createCircuit(CircuitDTO circuitDTO) {
        saveCircuit(circuitDTO);
    }

    @Override
    public CircuitDTO getCircuitById(Long id) {
        Optional<Circuit> circuit = circuitRepository.findById(id);
        CircuitDTO circuitDTO = null;
        if (circuit.isPresent())
            circuitDTO = mapper.convertValue(circuit, CircuitDTO.class);
        return circuitDTO;
    }

    @Override
    public void updateCircuit(CircuitDTO circuitDTO) {
        saveCircuit(circuitDTO);
    }

    @Override
    public void deleteCircuit(Long id) {
        circuitRepository.deleteById(id);
    }

    @Override
    public Set<CircuitDTO> getAllCircuits() {
        List<Circuit> circuits = circuitRepository.findAll();
        Set<CircuitDTO> circuitsDTO = new HashSet<>();
        for (Circuit circuit : circuits) {
            circuitsDTO.add(mapper.convertValue(circuit, CircuitDTO.class));
        }
        return circuitsDTO;
    }
}
