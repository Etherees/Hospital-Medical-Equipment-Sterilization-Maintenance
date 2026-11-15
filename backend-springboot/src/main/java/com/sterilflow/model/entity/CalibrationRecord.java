package com.sterilflow.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "calibration_records")
public class CalibrationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String certificateNumber;

    @Column(nullable = false, length = 50)
    private String equipmentId;

    @Column(length = 150)
    private String equipmentName;

    @Column(nullable = false, length = 100)
    private String engineerName;

    @Column(length = 100)
    private String standardUsed; // Fluke 754 NIST, Omega RTD, Druck DPI 610

    private Double accuracyDriftPercent = 0.08;

    private Boolean tolerancePassed = true;

    @Column(nullable = false, length = 50)
    private String status; // CERTIFIED, PENDING, FAILED

    @Column(length = 1000)
    private String notes;

    private LocalDateTime calibratedAt = LocalDateTime.now();
    private LocalDateTime validUntil = LocalDateTime.now().plusMonths(6);

    public CalibrationRecord() {}

    public CalibrationRecord(String certificateNumber, String equipmentId, String equipmentName, 
                             String engineerName, String standardUsed, Double accuracyDriftPercent, 
                             Boolean tolerancePassed, String status, String notes, 
                             LocalDateTime calibratedAt, LocalDateTime validUntil) {
        this.certificateNumber = certificateNumber;
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.engineerName = engineerName;
        this.standardUsed = standardUsed;
        this.accuracyDriftPercent = accuracyDriftPercent;
        this.tolerancePassed = tolerancePassed;
        this.status = status;
        this.notes = notes;
        this.calibratedAt = calibratedAt;
        this.validUntil = validUntil;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String certificateNumber) { this.certificateNumber = certificateNumber; }
    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public String getEngineerName() { return engineerName; }
    public void setEngineerName(String engineerName) { this.engineerName = engineerName; }
    public String getStandardUsed() { return standardUsed; }
    public void setStandardUsed(String standardUsed) { this.standardUsed = standardUsed; }
    public Double getAccuracyDriftPercent() { return accuracyDriftPercent; }
    public void setAccuracyDriftPercent(Double accuracyDriftPercent) { this.accuracyDriftPercent = accuracyDriftPercent; }
    public Boolean getTolerancePassed() { return tolerancePassed; }
    public void setTolerancePassed(Boolean tolerancePassed) { this.tolerancePassed = tolerancePassed; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCalibratedAt() { return calibratedAt; }
    public void setCalibratedAt(LocalDateTime calibratedAt) { this.calibratedAt = calibratedAt; }
    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }
}