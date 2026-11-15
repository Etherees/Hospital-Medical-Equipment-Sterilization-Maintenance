package com.sterilflow.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String ticketNumber;

    @Column(nullable = false, length = 50)
    private String equipmentId;

    @Column(length = 150)
    private String equipmentName;

    @Column(nullable = false, length = 50)
    private String maintenanceType; // PREVENTIVE, CORRECTIVE, CALIBRATION_TUNING, EMERGENCY

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(length = 100)
    private String assignedEngineer;

    @Column(nullable = false, length = 50)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false, length = 50)
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    private LocalDateTime scheduledDate;
    private LocalDateTime completedDate;

    private Double costUsd = 0.0;

    public MaintenanceRecord() {}

    public MaintenanceRecord(String ticketNumber, String equipmentId, String equipmentName, 
                             String maintenanceType, String description, String assignedEngineer, 
                             String priority, String status, LocalDateTime scheduledDate, 
                             LocalDateTime completedDate, Double costUsd) {
        this.ticketNumber = ticketNumber;
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.maintenanceType = maintenanceType;
        this.description = description;
        this.assignedEngineer = assignedEngineer;
        this.priority = priority;
        this.status = status;
        this.scheduledDate = scheduledDate;
        this.completedDate = completedDate;
        this.costUsd = costUsd;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }
    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public String getMaintenanceType() { return maintenanceType; }
    public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAssignedEngineer() { return assignedEngineer; }
    public void setAssignedEngineer(String assignedEngineer) { this.assignedEngineer = assignedEngineer; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }
    public LocalDateTime getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDateTime completedDate) { this.completedDate = completedDate; }
    public Double getCostUsd() { return costUsd; }
    public void setCostUsd(Double costUsd) { this.costUsd = costUsd; }
}