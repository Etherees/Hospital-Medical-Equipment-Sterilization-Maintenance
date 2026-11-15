package com.sterilflow.repository;

import com.sterilflow.model.entity.QualityInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QualityInspectionRepository extends JpaRepository<QualityInspection, Long> {
    Optional<QualityInspection> findByInspectionCode(String inspectionCode);
    List<QualityInspection> findByRequestId(String requestId);
    List<QualityInspection> findAllByOrderByInspectedAtDesc();
}