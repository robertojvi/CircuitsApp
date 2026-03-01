package com.example.fiberTower.repository;

import com.example.fiberTower.model.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ISiteRepository extends JpaRepository<Site, Long> {
}
