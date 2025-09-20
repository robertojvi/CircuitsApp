package com.example.fiberTower.repository;

import com.example.fiberTower.model.Circuit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICircuitRepository extends JpaRepository<Circuit, Long> {
}
