package com.sterilflow.service;

import com.sterilflow.model.entity.Equipment;
import com.sterilflow.model.entity.MaintenanceRecord;
import com.sterilflow.repository.EquipmentRepository;
import com.sterilflow.repository.MaintenanceRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRecordRepository maintenanceRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    public List<MaintenanceRecord> getAllRecords() {
        return maintenanceRepository.findAllByOrderByScheduledDateDesc();
    }

    public List<MaintenanceRecord> getRecordsByStatus(String status) {
        return maintenanceRepository.findByStatusOrderByScheduledDateDesc(status);
    }

    @Transactional
    public MaintenanceRecord createTicket(MaintenanceRecord ticket) {
        if (ticket.getTicketNumber() == null) {
            ticket.setTicketNumber("MNT-" + (System.currentTimeMillis() % 100000));
        }
        if (ticket.getScheduledDate() == null) {
            ticket.setScheduledDate(LocalDateTime.now());
        }

        // Update equipment status
        Optional<Equipment> eqOpt = equipmentRepository.findByEquipmentId(ticket.getEquipmentId());
        eqOpt.ifPresent(eq -> {
            eq.setCurrentStatus("MAINTENANCE_REQUIRED");
            equipmentRepository.save(eq);
        });

        return maintenanceRepository.save(ticket);
    }

    @Transactional
    public MaintenanceRecord resolveTicket(String ticketNumber, String notes) {
        MaintenanceRecord ticket = maintenanceRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketNumber));

        ticket.setStatus("RESOLVED");
        ticket.setCompletedDate(LocalDateTime.now());
        if (notes != null) {
            ticket.setDescription(ticket.getDescription() + " [Resolution: " + notes + "]");
        }

        // Return equipment to available if no other active maintenance
        equipmentRepository.findByEquipmentId(ticket.getEquipmentId()).ifPresent(eq -> {
            eq.setCurrentStatus("AVAILABLE");
            equipmentRepository.save(eq);
        });

        return maintenanceRepository.save(ticket);
    }
}