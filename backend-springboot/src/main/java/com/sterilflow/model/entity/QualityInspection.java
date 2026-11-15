package com.sterilflow.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quality_inspections")
public class QualityInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String inspectionCode;

    @Column(nullable = false, length = 50)
    private String requestId;

    @Column(length = 50)
    private String trayId;

    @Column(nullable = false, length = 100)
    private String inspectorName;

    private Boolean visualCheckPassed = true;
    private Boolean drynessCheckPassed = true;
    private Boolean barrierIntegrityPassed = true;
    private Boolean chemicalIndicatorPassed = true;
    private Boolean biologicalSporeNegative = true;
    private Boolean approved = true;

    @Column(length = 1000)
    private String inspectionNotes;

    private LocalDateTime inspectedAt = LocalDateTime.now();

    public QualityInspection() {}

    public QualityInspection(String inspectionCode, String requestId, String trayId, 
                             String inspectorName, Boolean visualCheckPassed, Boolean drynessCheckPassed, 
                             Boolean barrierIntegrityPassed, Boolean chemicalIndicatorPassed, 
                             Boolean biologicalSporeNegative, Boolean approved, String inspectionNotes) {
        this.inspectionCode = inspectionCode;
        this.requestId = requestId;
        this.trayId = trayId;
        this.inspectorName = inspectorName;
        this.visualCheckPassed = visualCheckPassed;
        this.drynessCheckPassed = drynessCheckPassed;
        this.barrierIntegrityPassed = barrierIntegrityPassed;
        this.chemicalIndicatorPassed = chemicalIndicatorPassed;
        this.biologicalSporeNegative = biologicalSporeNegative;
        this.approved = approved;
        this.inspectionNotes = inspectionNotes;
        this.inspectedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInspectionCode() { return inspectionCode; }
    public void setInspectionCode(String inspectionCode) { this.inspectionCode = inspectionCode; }
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public String getTrayId() { return trayId; }
    public void setTrayId(String trayId) { this.trayId = trayId; }
    public String getInspectorName() { return inspectorName; }
    public void setInspectorName(String inspectorName) { this.inspectorName = inspectorName; }
    public Boolean getVisualCheckPassed() { return visualCheckPassed; }
    public void setVisualCheckPassed(Boolean visualCheckPassed) { this.visualCheckPassed = visualCheckPassed; }
    public Boolean getDrynessCheckPassed() { return drynessCheckPassed; }
    public void setDrynessCheckPassed(Boolean drynessCheckPassed) { this.drynessCheckPassed = drynessCheckPassed; }
    public Boolean getBarrierIntegrityPassed() { return barrierIntegrityPassed; }
    public void setBarrierIntegrityPassed(Boolean barrierIntegrityPassed) { this.barrierIntegrityPassed = barrierIntegrityPassed; }
    public Boolean getChemicalIndicatorPassed() { return chemicalIndicatorPassed; }
    public void setChemicalIndicatorPassed(Boolean chemicalIndicatorPassed) { this.chemicalIndicatorPassed = chemicalIndicatorPassed; }
    public Boolean getBiologicalSporeNegative() { return biologicalSporeNegative; }
    public void setBiologicalSporeNegative(Boolean biologicalSporeNegative) { this.biologicalSporeNegative = biologicalSporeNegative; }
    public Boolean getApproved() { return approved; }
    public void setApproved(Boolean approved) { this.approved = approved; }
    public String getInspectionNotes() { return inspectionNotes; }
    public void setInspectionNotes(String inspectionNotes) { this.inspectionNotes = inspectionNotes; }
    public LocalDateTime getInspectedAt() { return inspectedAt; }
    public void setInspectedAt(LocalDateTime inspectedAt) { this.inspectedAt = inspectedAt; }
}