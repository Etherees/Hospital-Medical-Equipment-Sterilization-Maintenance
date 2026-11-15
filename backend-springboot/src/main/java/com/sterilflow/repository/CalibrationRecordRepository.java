package com.sterilflow.repository;

import com.sterilflow.model.entity.CalibrationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CalibrationRecordRepository extends JpaRepository<CalibrationRecord, Long> {
    Optional<CalibrationRecord> findByCertificateNumber(String certNum);
    List<CalibrationRecord> findByEquipmentIdOrderByCalibratedAtDesc(String equipmentId);
    List<CalibrationRecord> findAllByOrderByCalibratedAtDesc();
    
    @Query("SELECT COUNT(c) FROM CalibrationRecord c WHERE c.status = 'CERTIFIED'")
    long countCertified();
}