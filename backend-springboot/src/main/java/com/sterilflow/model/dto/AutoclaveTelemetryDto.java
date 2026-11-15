package com.sterilflow.model.dto;

import java.time.LocalDateTime;

public class AutoclaveTelemetryDto {
    private String machineCode;
    private String model;
    private String chamberStatus;
    private Double currentTemperature;
    private Double currentPressure;
    private Double targetTemperature;
    private Double targetPressure;
    private Boolean isAvailable;
    private String currentPhase;
    private Integer cycleProgressPercent;
    private String chemicalIndicatorStatus; // PASS, FAIL, EXPOSING
    private String biologicalIndicatorStatus; // NEGATIVE, POSITIVE, INCUBATING
    private LocalDateTime timestamp = LocalDateTime.now();

    public AutoclaveTelemetryDto() {}

    public String getMachineCode() { return machineCode; }
    public void setMachineCode(String machineCode) { this.machineCode = machineCode; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getChamberStatus() { return chamberStatus; }
    public void setChamberStatus(String chamberStatus) { this.chamberStatus = chamberStatus; }
    public Double getCurrentTemperature() { return currentTemperature; }
    public void setCurrentTemperature(Double currentTemperature) { this.currentTemperature = currentTemperature; }
    public Double getCurrentPressure() { return currentPressure; }
    public void setCurrentPressure(Double currentPressure) { this.currentPressure = currentPressure; }
    public Double getTargetTemperature() { return targetTemperature; }
    public void setTargetTemperature(Double targetTemperature) { this.targetTemperature = targetTemperature; }
    public Double getTargetPressure() { return targetPressure; }
    public void setTargetPressure(Double targetPressure) { this.targetPressure = targetPressure; }
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    public String getCurrentPhase() { return currentPhase; }
    public void setCurrentPhase(String currentPhase) { this.currentPhase = currentPhase; }
    public Integer getCycleProgressPercent() { return cycleProgressPercent; }
    public void setCycleProgressPercent(Integer cycleProgressPercent) { this.cycleProgressPercent = cycleProgressPercent; }
    public String getChemicalIndicatorStatus() { return chemicalIndicatorStatus; }
    public void setChemicalIndicatorStatus(String chemicalIndicatorStatus) { this.chemicalIndicatorStatus = chemicalIndicatorStatus; }
    public String getBiologicalIndicatorStatus() { return biologicalIndicatorStatus; }
    public void setBiologicalIndicatorStatus(String biologicalIndicatorStatus) { this.biologicalIndicatorStatus = biologicalIndicatorStatus; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}