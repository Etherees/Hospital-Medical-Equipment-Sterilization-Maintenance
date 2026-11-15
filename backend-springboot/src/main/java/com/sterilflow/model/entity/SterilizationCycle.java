package com.sterilflow.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sterilization_cycles")
public class SterilizationCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String cycleNumber;

    @Column(nullable = false, length = 50)
    private String autoclaveId;

    @Column(length = 100)
    private String autoclaveModel;

    private Double targetTemperature = 134.0;
    private Double targetPressure = 2.2;
    private Double currentTemperature = 134.2;
    private Double currentPressure = 2.24;

    @Column(nullable = false, length = 50)
    private String phase; // STANDBY, VACUUM_PURGE, STEAM_INJECTION, STERILIZATION_HOLD, FAST_EXHAUST, VACUUM_DRYING, AERATION, COMPLETED, ALARM_FAILED

    private Integer progressPercent = 100;
    private Integer durationSeconds = 900;

    @Column(length = 50)
    private String chemicalIndicatorResult; // PASSED, FAILED, IN_PROGRESS

    @Column(length = 50)
    private String biologicalIndicatorResult; // NEGATIVE_CLEAR, PENDING, POSITIVE_CONTAMINATED

    @Column(nullable = false, length = 50)
    private String status; // ACTIVE, COMPLETED, FAILED

    @Column(length = 50)
    private String requestId;

    private LocalDateTime startedAt = LocalDateTime.now().minusMinutes(15);
    private LocalDateTime endedAt = LocalDateTime.now();

    public SterilizationCycle() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCycleNumber() { return cycleNumber; }
    public void setCycleNumber(String cycleNumber) { this.cycleNumber = cycleNumber; }
    public String getAutoclaveId() { return autoclaveId; }
    public void setAutoclaveId(String autoclaveId) { this.autoclaveId = autoclaveId; }
    public String getAutoclaveModel() { return autoclaveModel; }
    public void setAutoclaveModel(String autoclaveModel) { this.autoclaveModel = autoclaveModel; }
    public Double getTargetTemperature() { return targetTemperature; }
    public void setTargetTemperature(Double targetTemperature) { this.targetTemperature = targetTemperature; }
    public Double getTargetPressure() { return targetPressure; }
    public void setTargetPressure(Double targetPressure) { this.targetPressure = targetPressure; }
    public Double getCurrentTemperature() { return currentTemperature; }
    public void setCurrentTemperature(Double currentTemperature) { this.currentTemperature = currentTemperature; }
    public Double getCurrentPressure() { return currentPressure; }
    public void setCurrentPressure(Double currentPressure) { this.currentPressure = currentPressure; }
    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }
    public Integer getProgressPercent() { return progressPercent; }
    public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getChemicalIndicatorResult() { return chemicalIndicatorResult; }
    public void setChemicalIndicatorResult(String chemicalIndicatorResult) { this.chemicalIndicatorResult = chemicalIndicatorResult; }
    public String getBiologicalIndicatorResult() { return biologicalIndicatorResult; }
    public void setBiologicalIndicatorResult(String biologicalIndicatorResult) { this.biologicalIndicatorResult = biologicalIndicatorResult; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
}