package com.sterilflow.service;

import com.sterilflow.model.entity.Equipment;
import com.sterilflow.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Optional<Equipment> getByEquipmentId(String equipmentId) {
        return equipmentRepository.findByEquipmentId(equipmentId);
    }

    public List<Equipment> getByCategory(String category) {
        return equipmentRepository.findByCategory(category);
    }

    @Transactional
    public Equipment saveEquipment(Equipment equipment) {
        if (equipment.getCreatedAt() == null) {
            equipment.setCreatedAt(LocalDateTime.now());
        }
        return equipmentRepository.save(equipment);
    }

    @Transactional
    public Equipment updateStatus(String equipmentId, String status) {
        Equipment equipment = equipmentRepository.findByEquipmentId(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found: " + equipmentId));
        equipment.setCurrentStatus(status);
        return equipmentRepository.save(equipment);
    }
}