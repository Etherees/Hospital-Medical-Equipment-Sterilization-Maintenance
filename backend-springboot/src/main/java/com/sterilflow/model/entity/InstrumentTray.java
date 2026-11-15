package com.sterilflow.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "instrument_trays")
public class InstrumentTray {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String trayId;

    @Column(nullable = false, length = 150)
    private String trayName;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false, length = 50)
    private String currentStatus; // AWAITING_STERILIZATION, IN_STERILIZATION, STERILIZED, FAILED_INSPECTION, QUARANTINED, MAINTENANCE_REQUIRED

    @Column(length = 20)
    private String priority; // NORMAL, HIGH, EMERGENCY

    private Integer sterilizationCycleCount = 0;

    @Column(length = 50)
    private String autoclaveId = "AC-01";

    private Boolean calibrationRequired = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipment_ref_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Equipment equipment;

    @OneToMany(mappedBy = "tray", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Instrument> instruments = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    public InstrumentTray() {}

    public InstrumentTray(String trayId, String trayName, String department, String currentStatus, 
                          String priority, Integer sterilizationCycleCount, String autoclaveId, 
                          Boolean calibrationRequired, Equipment equipment) {
        this.trayId = trayId;
        this.trayName = trayName;
        this.department = department;
        this.currentStatus = currentStatus;
        this.priority = priority;
        this.sterilizationCycleCount = sterilizationCycleCount;
        this.autoclaveId = autoclaveId;
        this.calibrationRequired = calibrationRequired;
        this.equipment = equipment;
        this.createdAt = LocalDateTime.now();
    }

    public void addInstrument(Instrument instrument) {
        instruments.add(instrument);
        instrument.setTray(this);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTrayId() { return trayId; }
    public void setTrayId(String trayId) { this.trayId = trayId; }
    public String getTrayName() { return trayName; }
    public void setTrayName(String trayName) { this.trayName = trayName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public Integer getSterilizationCycleCount() { return sterilizationCycleCount; }
    public void setSterilizationCycleCount(Integer sterilizationCycleCount) { this.sterilizationCycleCount = sterilizationCycleCount; }
    public String getAutoclaveId() { return autoclaveId; }
    public void setAutoclaveId(String autoclaveId) { this.autoclaveId = autoclaveId; }
    public Boolean getCalibrationRequired() { return calibrationRequired; }
    public void setCalibrationRequired(Boolean calibrationRequired) { this.calibrationRequired = calibrationRequired; }
    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }
    public List<Instrument> getInstruments() { return instruments; }
    public void setInstruments(List<Instrument> instruments) { this.instruments = instruments; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}