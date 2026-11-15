package com.sterilflow.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sterilization_requests")
public class SterilizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String requestId;

    @Column(length = 100)
    private String processInstanceId;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(length = 100)
    private String operatingTheatre;

    @Column(length = 100)
    private String equipmentCategory;

    @Column(length = 50)
    private String equipmentId;

    @Column(length = 50)
    private String contaminationLevel; // LOW, MEDIUM, HIGH, BIOHAZARD

    @Column(length = 50)
    private String cleaningStatus; // PENDING, CLEANED, REWORK_REQUIRED, PASSED

    @Column(length = 100)
    private String sterilizationMethod; // STEAM_AUTOCLAVE_134C, STEAM_AUTOCLAVE_121C, HYDROGEN_PEROXIDE_PLASMA, ETO_GAS

    @Column(length = 100)
    private String assignedTechnician;

    @Column(length = 50)
    private String priority; // NORMAL, HIGH, URGENT

    @Column(length = 1000)
    private String notes;

    @Column(length = 100)
    private String currentStage; // REGISTRATION, INITIAL_INSPECTION, CLEANING_VERIFICATION, STERILIZATION_INITIATION, AUTOCLAVE_PROCESSING, CHEMICAL_INDICATOR_CHECK, QUALITY_INSPECTION, CALIBRATION, FINAL_APPROVAL, RELEASED, QUARANTINED

    @Column(length = 50)
    private String status; // IN_PROGRESS, COMPLETED, FAILED, QUARANTINED

    private Boolean cleaningPassed = true;
    private Boolean chemicalIndicatorPassed = true;
    private Boolean finalApprovalPassed = true;

    private Integer trayCount = 1;

    private LocalDateTime startedAt = LocalDateTime.now();
    private LocalDateTime completedAt;

    public SterilizationRequest() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public String getProcessInstanceId() { return processInstanceId; }
    public void setProcessInstanceId(String processInstanceId) { this.processInstanceId = processInstanceId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getOperatingTheatre() { return operatingTheatre; }
    public void setOperatingTheatre(String operatingTheatre) { this.operatingTheatre = operatingTheatre; }
    public String getEquipmentCategory() { return equipmentCategory; }
    public void setEquipmentCategory(String equipmentCategory) { this.equipmentCategory = equipmentCategory; }
    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getContaminationLevel() { return contaminationLevel; }
    public void setContaminationLevel(String contaminationLevel) { this.contaminationLevel = contaminationLevel; }
    public String getCleaningStatus() { return cleaningStatus; }
    public void setCleaningStatus(String cleaningStatus) { this.cleaningStatus = cleaningStatus; }
    public String getSterilizationMethod() { return sterilizationMethod; }
    public void setSterilizationMethod(String sterilizationMethod) { this.sterilizationMethod = sterilizationMethod; }
    public String getAssignedTechnician() { return assignedTechnician; }
    public void setAssignedTechnician(String assignedTechnician) { this.assignedTechnician = assignedTechnician; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getCurrentStage() { return currentStage; }
    public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getCleaningPassed() { return cleaningPassed; }
    public void setCleaningPassed(Boolean cleaningPassed) { this.cleaningPassed = cleaningPassed; }
    public Boolean getChemicalIndicatorPassed() { return chemicalIndicatorPassed; }
    public void setChemicalIndicatorPassed(Boolean chemicalIndicatorPassed) { this.chemicalIndicatorPassed = chemicalIndicatorPassed; }
    public Boolean getFinalApprovalPassed() { return finalApprovalPassed; }
    public void setFinalApprovalPassed(Boolean finalApprovalPassed) { this.finalApprovalPassed = finalApprovalPassed; }
    public Integer getTrayCount() { return trayCount; }
    public void setTrayCount(Integer trayCount) { this.trayCount = trayCount; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}