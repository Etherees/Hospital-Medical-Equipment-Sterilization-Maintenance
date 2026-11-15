package com.sterilflow.service;

import com.sterilflow.model.dto.CalibrationActionDto;
import com.sterilflow.model.entity.CalibrationRecord;
import com.sterilflow.model.entity.Equipment;
import com.sterilflow.repository.CalibrationRecordRepository;
import com.sterilflow.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CalibrationService {

    @Autowired
    private CalibrationRecordRepository calibrationRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    public List<CalibrationRecord> getAllRecords() {
        return calibrationRepository.findAllByOrderByCalibratedAtDesc();
    }

    public List<CalibrationRecord> getRecordsForEquipment(String equipmentId) {
        return calibrationRepository.findByEquipmentIdOrderByCalibratedAtDesc(equipmentId);
    }

    @Transactional
    public CalibrationRecord performCalibration(CalibrationActionDto dto) {
        String certNum = "CAL-ISO17025-" + (System.currentTimeMillis() % 100000);
        String equipmentName = "Medical Device " + dto.getEquipmentId();

        Optional<Equipment> eqOpt = equipmentRepository.findByEquipmentId(dto.getEquipmentId());
        if (eqOpt.isPresent()) {
            Equipment eq = eqOpt.get();
            equipmentName = eq.getName();
            eq.setCalibrationStatus(dto.getTolerancePassed() ? "VALID" : "OVERDUE");
            eq.setNextMaintenanceDate(LocalDateTime.now().plusMonths(6));
            equipmentRepository.save(eq);
        }

        CalibrationRecord record = new CalibrationRecord(
            certNum,
            dto.getEquipmentId(),
            equipmentName,
            dto.getEngineerName() != null ? dto.getEngineerName() : "Eng. Marcus Vance, CBET",
            dto.getStandardUsed() != null ? dto.getStandardUsed() : "Fluke 754 NIST Calibrator",
            dto.getAccuracyDriftPercent() != null ? dto.getAccuracyDriftPercent() : 0.05,
            dto.getTolerancePassed(),
            dto.getTolerancePassed() ? "CERTIFIED" : "FAILED",
            dto.getNotes(),
            LocalDateTime.now(),
            LocalDateTime.now().plusMonths(6)
        );

        return calibrationRepository.save(record);
    }
}