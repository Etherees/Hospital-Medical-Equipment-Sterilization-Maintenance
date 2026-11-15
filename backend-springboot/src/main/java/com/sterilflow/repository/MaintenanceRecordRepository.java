package com.sterilflow.repository;

import com.sterilflow.model.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    Optional<MaintenanceRecord> findByTicketNumber(String ticketNum);
    List<MaintenanceRecord> findByEquipmentId(String equipmentId);
    List<MaintenanceRecord> findByStatusOrderByScheduledDateDesc(String status);
    List<MaintenanceRecord> findAllByOrderByScheduledDateDesc();
    
    @Query("SELECT COUNT(m) FROM MaintenanceRecord m WHERE m.status IN ('OPEN', 'IN_PROGRESS')")
    long countActiveTickets();

    @Query("SELECT COUNT(m) FROM MaintenanceRecord m WHERE m.priority = 'CRITICAL'")
    long countCriticalAlerts();
}