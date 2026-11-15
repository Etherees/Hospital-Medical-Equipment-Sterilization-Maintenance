package com.sterilflow.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

public class SterilizationRequestDto {

    @NotBlank(message = "Hospital department is required")
    private String department;

    private String operatingTheatre;

    @NotBlank(message = "Equipment category is required")
    private String equipmentCategory;

    @NotBlank(message = "Equipment ID is required")
    private String equipmentId;

    private String contaminationLevel = "MEDIUM"; // LOW, MEDIUM, HIGH, BIOHAZARD
    private String cleaningStatus = "PENDING";
    private String sterilizationMethod = "STEAM_AUTOCLAVE_134C";
    private String assignedTechnician = "tech_sarah_connor";
    private String priority = "NORMAL";
    private String notes;

    @NotEmpty(message = "At least one surgical instrument tray must be included in the batch")
    private List<TrayItemDto> trays = new ArrayList<>();

    public SterilizationRequestDto() {}

    // Getters and Setters
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
    public List<TrayItemDto> getTrays() { return trays; }
    public void setTrays(List<TrayItemDto> trays) { this.trays = trays; }
}