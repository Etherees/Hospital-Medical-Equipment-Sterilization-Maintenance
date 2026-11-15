package com.sterilflow.model.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalEquipmentRegistered;
    private long equipmentAwaitingSterilization;
    private long sterilizationCyclesInProgress;
    private long successfullySterilizedTrays;
    private long failedSterilizationCycles;
    private long equipmentRequiringCalibration;
    private long equipmentUnderMaintenance;
    private long overdueMaintenanceAlerts;
    private double sterilizationSuccessRate;
    private double maintenanceComplianceRate;
    private List<Map<String, Object>> recentWorkflowExecutions;
    private List<Map<String, Object>> liveActivityTimeline;
    private List<Map<String, Object>> sterilizationPerformanceChart;
    private List<Map<String, Object>> equipmentStatusDistribution;
    private List<Map<String, Object>> criticalAlerts;
    private List<Map<String, Object>> upcomingCalibrations;

    public DashboardStatsDto() {}

    // Getters and Setters
    public long getTotalEquipmentRegistered() { return totalEquipmentRegistered; }
    public void setTotalEquipmentRegistered(long totalEquipmentRegistered) { this.totalEquipmentRegistered = totalEquipmentRegistered; }
    public long getEquipmentAwaitingSterilization() { return equipmentAwaitingSterilization; }
    public void setEquipmentAwaitingSterilization(long equipmentAwaitingSterilization) { this.equipmentAwaitingSterilization = equipmentAwaitingSterilization; }
    public long getSterilizationCyclesInProgress() { return sterilizationCyclesInProgress; }
    public void setSterilizationCyclesInProgress(long sterilizationCyclesInProgress) { this.sterilizationCyclesInProgress = sterilizationCyclesInProgress; }
    public long getSuccessfullySterilizedTrays() { return successfullySterilizedTrays; }
    public void setSuccessfullySterilizedTrays(long successfullySterilizedTrays) { this.successfullySterilizedTrays = successfullySterilizedTrays; }
    public long getFailedSterilizationCycles() { return failedSterilizationCycles; }
    public void setFailedSterilizationCycles(long failedSterilizationCycles) { this.failedSterilizationCycles = failedSterilizationCycles; }
    public long getEquipmentRequiringCalibration() { return equipmentRequiringCalibration; }
    public void setEquipmentRequiringCalibration(long equipmentRequiringCalibration) { this.equipmentRequiringCalibration = equipmentRequiringCalibration; }
    public long getEquipmentUnderMaintenance() { return equipmentUnderMaintenance; }
    public void setEquipmentUnderMaintenance(long equipmentUnderMaintenance) { this.equipmentUnderMaintenance = equipmentUnderMaintenance; }
    public long getOverdueMaintenanceAlerts() { return overdueMaintenanceAlerts; }
    public void setOverdueMaintenanceAlerts(long overdueMaintenanceAlerts) { this.overdueMaintenanceAlerts = overdueMaintenanceAlerts; }
    public double getSterilizationSuccessRate() { return sterilizationSuccessRate; }
    public void setSterilizationSuccessRate(double sterilizationSuccessRate) { this.sterilizationSuccessRate = sterilizationSuccessRate; }
    public double getMaintenanceComplianceRate() { return maintenanceComplianceRate; }
    public void setMaintenanceComplianceRate(double maintenanceComplianceRate) { this.maintenanceComplianceRate = maintenanceComplianceRate; }
    public List<Map<String, Object>> getRecentWorkflowExecutions() { return recentWorkflowExecutions; }
    public void setRecentWorkflowExecutions(List<Map<String, Object>> recentWorkflowExecutions) { this.recentWorkflowExecutions = recentWorkflowExecutions; }
    public List<Map<String, Object>> getLiveActivityTimeline() { return liveActivityTimeline; }
    public void setLiveActivityTimeline(List<Map<String, Object>> liveActivityTimeline) { this.liveActivityTimeline = liveActivityTimeline; }
    public List<Map<String, Object>> getSterilizationPerformanceChart() { return sterilizationPerformanceChart; }
    public void setSterilizationPerformanceChart(List<Map<String, Object>> sterilizationPerformanceChart) { this.sterilizationPerformanceChart = sterilizationPerformanceChart; }
    public List<Map<String, Object>> getEquipmentStatusDistribution() { return equipmentStatusDistribution; }
    public void setEquipmentStatusDistribution(List<Map<String, Object>> equipmentStatusDistribution) { this.equipmentStatusDistribution = equipmentStatusDistribution; }
    public List<Map<String, Object>> getCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(List<Map<String, Object>> criticalAlerts) { this.criticalAlerts = criticalAlerts; }
    public List<Map<String, Object>> getUpcomingCalibrations() { return upcomingCalibrations; }
    public void setUpcomingCalibrations(List<Map<String, Object>> upcomingCalibrations) { this.upcomingCalibrations = upcomingCalibrations; }
}