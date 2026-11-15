package com.sterilflow.model.dto;

public class CalibrationActionDto {
    private String equipmentId;
    private String engineerName;
    private String standardUsed;
    private Double accuracyDriftPercent;
    private Boolean tolerancePassed = true;
    private String notes;

    public CalibrationActionDto() {}

    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getEngineerName() { return engineerName; }
    public void setEngineerName(String engineerName) { this.engineerName = engineerName; }
    public String getStandardUsed() { return standardUsed; }
    public void setStandardUsed(String standardUsed) { this.standardUsed = standardUsed; }
    public Double getAccuracyDriftPercent() { return accuracyDriftPercent; }
    public void setAccuracyDriftPercent(Double accuracyDriftPercent) { this.accuracyDriftPercent = accuracyDriftPercent; }
    public Boolean getTolerancePassed() { return tolerancePassed; }
    public void setTolerancePassed(Boolean tolerancePassed) { this.tolerancePassed = tolerancePassed; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}