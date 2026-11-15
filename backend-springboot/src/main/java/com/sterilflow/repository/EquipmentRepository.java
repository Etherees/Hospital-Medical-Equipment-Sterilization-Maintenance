package com.sterilflow.repository;

import com.sterilflow.model.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Optional<Equipment> findByEquipmentId(String equipmentId);
    List<Equipment> findByCategory(String category);
    List<Equipment> findByCurrentStatus(String currentStatus);
    List<Equipment> findByCalibrationStatus(String calibrationStatus);
    
    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.currentStatus = 'MAINTENANCE_REQUIRED'")
    long countMaintenanceRequired();

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.calibrationStatus IN ('OVERDUE', 'DUE_SOON')")
    long countCalibrationDue();
}
