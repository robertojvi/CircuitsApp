package com.example.fiberTower.repository;

import com.example.fiberTower.model.ProjectUpdateImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IProjectUpdateImageRepository extends JpaRepository<ProjectUpdateImage, Long> {
}
