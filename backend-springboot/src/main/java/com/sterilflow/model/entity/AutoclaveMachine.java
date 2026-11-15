package com.sterilflow.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "autoclave_machines")
public class AutoclaveMachine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String machineCode; // AC-01, AC-02, AC-03

    @Column(nullable = false, length = 150)
    private String model;

    @Column(nullable = false, length = 50)
    private String chamberStatus; // IDLE, RUNNING, STERILIZING, DRYING, MAINTENANCE, OFFLINE

    private Double currentTemperature = 134.2;
    private Double currentPressure = 2.21;
    private Double targetTemperature = 134.0;
    private Double targetPressure = 2.20;

    private Boolean isAvailable = true;
    private Integer totalCyclesRun = 1240;
    private Integer maxChamberCapacity = 6;
    private Integer currentLoadedTrays = 2;

    @Column(length = 50)
    private String currentCycleNumber;

    @Column(length = 50)
    private String currentPhase; // STANDBY, STEAM_HOLD, etc.

    private Integer cycleProgressPercent = 0;

    private LocalDateTime lastServiceDate = LocalDateTime.now().minusDays(14);
    private LocalDateTime nextServiceDate = LocalDateTime.now().plusDays(76);

    public AutoclaveMachine() {}

    public AutoclaveMachine(String machineCode, String model, String chamberStatus, 
                            Double currentTemperature, Double currentPressure, Boolean isAvailable, 
                            Integer totalCyclesRun, Integer maxChamberCapacity) {
        this.machineCode = machineCode;
        this.model = model;
        this.chamberStatus = chamberStatus;
        this.currentTemperature = currentTemperature;
        this.currentPressure = currentPressure;
        this.isAvailable = isAvailable;
        this.totalCyclesRun = totalCyclesRun;
        this.maxChamberCapacity = maxChamberCapacity;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Integer getTotalCyclesRun() { return totalCyclesRun; }
    public void setTotalCyclesRun(Integer totalCyclesRun) { this.totalCyclesRun = totalCyclesRun; }
    public Integer getMaxChamberCapacity() { return maxChamberCapacity; }
    public void setMaxChamberCapacity(Integer maxChamberCapacity) { this.maxChamberCapacity = maxChamberCapacity; }
    public Integer getCurrentLoadedTrays() { return currentLoadedTrays; }
    public void setCurrentLoadedTrays(Integer currentLoadedTrays) { this.currentLoadedTrays = currentLoadedTrays; }
    public String getCurrentCycleNumber() { return currentCycleNumber; }
    public void setCurrentCycleNumber(String currentCycleNumber) { this.currentCycleNumber = currentCycleNumber; }
    public String getCurrentPhase() { return currentPhase; }
    public void setCurrentPhase(String currentPhase) { this.currentPhase = currentPhase; }
    public Integer getCycleProgressPercent() { return cycleProgressPercent; }
    public void setCycleProgressPercent(Integer cycleProgressPercent) { this.cycleProgressPercent = cycleProgressPercent; }
    public LocalDateTime getLastServiceDate() { return lastServiceDate; }
    public void setLastServiceDate(LocalDateTime lastServiceDate) { this.lastServiceDate = lastServiceDate; }
    public LocalDateTime getNextServiceDate() { return nextServiceDate; }
    public void setNextServiceDate(LocalDateTime nextServiceDate) { this.nextServiceDate = nextServiceDate; }
}