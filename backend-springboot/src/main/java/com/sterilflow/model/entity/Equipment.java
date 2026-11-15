package com.sterilflow.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String equipmentId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(length = 100)
    private String manufacturer;

    @Column(length = 100)
    private String modelNumber;

    @Column(length = 100)
    private String serialNumber;

    @Column(length = 100)
    private String location;

    @Column(nullable = false, length = 50)
    private String currentStatus; // AVAILABLE, IN_USE, STERILIZING, MAINTENANCE_REQUIRED, QUARANTINED, CALIBRATION_PENDING

    private LocalDateTime lastSterilizationDate;

    private LocalDateTime nextMaintenanceDate;

    @Column(nullable = false, length = 50)
    private String calibrationStatus; // VALID, DUE_SOON, OVERDUE, CALIBRATED

    @Column(length = 2000)
    private String technicalSpecsJson;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Equipment() {}

    public Equipment(String equipmentId, String name, String category, String manufacturer, 
                     String modelNumber, String serialNumber, String location, String currentStatus, 
                     LocalDateTime lastSterilizationDate, LocalDateTime nextMaintenanceDate, 
                     String calibrationStatus, String technicalSpecsJson) {
        this.equipmentId = equipmentId;
        this.name = name;
        this.category = category;
        this.manufacturer = manufacturer;
        this.modelNumber = modelNumber;
        this.serialNumber = serialNumber;
        this.location = location;
        this.currentStatus = currentStatus;
        this.lastSterilizationDate = lastSterilizationDate;
        this.nextMaintenanceDate = nextMaintenanceDate;
        this.calibrationStatus = calibrationStatus;
        this.technicalSpecsJson = technicalSpecsJson;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public String getModelNumber() { return modelNumber; }
    public void setModelNumber(String modelNumber) { this.modelNumber = modelNumber; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }
    public LocalDateTime getLastSterilizationDate() { return lastSterilizationDate; }
    public void setLastSterilizationDate(LocalDateTime lastSterilizationDate) { this.lastSterilizationDate = lastSterilizationDate; }
    public LocalDateTime getNextMaintenanceDate() { return nextMaintenanceDate; }
    public void setNextMaintenanceDate(LocalDateTime nextMaintenanceDate) { this.nextMaintenanceDate = nextMaintenanceDate; }
    public String getCalibrationStatus() { return calibrationStatus; }
    public void setCalibrationStatus(String calibrationStatus) { this.calibrationStatus = calibrationStatus; }
    public String getTechnicalSpecsJson() { return technicalSpecsJson; }
    public void setTechnicalSpecsJson(String technicalSpecsJson) { this.technicalSpecsJson = technicalSpecsJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}