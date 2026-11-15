package com.sterilflow.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "instruments")
public class Instrument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String instrumentCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String type; // Scissors, Forceps, Needle Holder, Retractor, Clamp, Surgical Blade

    @Column(length = 150)
    private String material;

    @Column(nullable = false, length = 50)
    private String contaminationStatus; // CLEAN, BIO_BURDEN_LIGHT, BIO_BURDEN_HEAVY, PROTEIN_RESIDUE

    @Column(nullable = false, length = 50)
    private String sterilizationStatus; // Awaiting Sterilization, In Sterilization, Sterilized, Failed Inspection, Quarantined, Maintenance Required

    @Column(length = 50)
    private String previousSterilizationCycle;

    private LocalDateTime nextMaintenanceDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tray_id")
    @JsonBackReference
    private InstrumentTray tray;

    public Instrument() {}

    public Instrument(String instrumentCode, String name, String type, String material, 
                      String contaminationStatus, String sterilizationStatus, 
                      String previousSterilizationCycle, LocalDateTime nextMaintenanceDate) {
        this.instrumentCode = instrumentCode;
        this.name = name;
        this.type = type;
        this.material = material;
        this.contaminationStatus = contaminationStatus;
        this.sterilizationStatus = sterilizationStatus;
        this.previousSterilizationCycle = previousSterilizationCycle;
        this.nextMaintenanceDate = nextMaintenanceDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInstrumentCode() { return instrumentCode; }
    public void setInstrumentCode(String instrumentCode) { this.instrumentCode = instrumentCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public String getContaminationStatus() { return contaminationStatus; }
    public void setContaminationStatus(String contaminationStatus) { this.contaminationStatus = contaminationStatus; }
    public String getSterilizationStatus() { return sterilizationStatus; }
    public void setSterilizationStatus(String sterilizationStatus) { this.sterilizationStatus = sterilizationStatus; }
    public String getPreviousSterilizationCycle() { return previousSterilizationCycle; }
    public void setPreviousSterilizationCycle(String previousSterilizationCycle) { this.previousSterilizationCycle = previousSterilizationCycle; }
    public LocalDateTime getNextMaintenanceDate() { return nextMaintenanceDate; }
    public void setNextMaintenanceDate(LocalDateTime nextMaintenanceDate) { this.nextMaintenanceDate = nextMaintenanceDate; }
    public InstrumentTray getTray() { return tray; }
    public void setTray(InstrumentTray tray) { this.tray = tray; }
}