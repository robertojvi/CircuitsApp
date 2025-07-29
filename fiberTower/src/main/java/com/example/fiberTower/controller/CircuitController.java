package com.example.fiberTower.controller;

import com.example.fiberTower.model.CircuitDTO;
import com.example.fiberTower.service.ICircuitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping("/api/circuits")
public class CircuitController {
    @Autowired
    ICircuitService circuitService;

    @PostMapping
    public ResponseEntity<?> createCircuit(@RequestBody CircuitDTO circuitDTO) {
        circuitService.createCircuit(circuitDTO);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public CircuitDTO getCircuitById(@PathVariable Long id) {
        return circuitService.getCircuitById(id);
    }

    @PutMapping
    public ResponseEntity<?> updateCircuit(@RequestBody CircuitDTO circuitDTO) {
        circuitService.updateCircuit(circuitDTO);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCircuit(@PathVariable Long id) {
        circuitService.deleteCircuit(id);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @GetMapping
    public Collection<CircuitDTO> getAllCircuits() {
        return circuitService.getAllCircuits();
    }
}
