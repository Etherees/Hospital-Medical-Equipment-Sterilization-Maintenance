package com.sterilflow.model.dto;

public class TrayItemDto {
    private String trayId;
    private String trayName;
    private String autoclaveId = "AC-01";
    private Boolean calibrationRequired = false;

    public TrayItemDto() {}

    public TrayItemDto(String trayId, String trayName, String autoclaveId, Boolean calibrationRequired) {
        this.trayId = trayId;
        this.trayName = trayName;
        this.autoclaveId = autoclaveId;
        this.calibrationRequired = calibrationRequired;
    }

    public String getTrayId() { return trayId; }
    public void setTrayId(String trayId) { this.trayId = trayId; }
    public String getTrayName() { return trayName; }
    public void setTrayName(String trayName) { this.trayName = trayName; }
    public String getAutoclaveId() { return autoclaveId; }
    public void setAutoclaveId(String autoclaveId) { this.autoclaveId = autoclaveId; }
    public Boolean getCalibrationRequired() { return calibrationRequired; }
    public void setCalibrationRequired(Boolean calibrationRequired) { this.calibrationRequired = calibrationRequired; }
}