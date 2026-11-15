package com.sterilflow.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_tasks")
public class WorkflowTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String taskId; // TASK-8192

    @Column(nullable = false, length = 150)
    private String taskName; // Initial Inspection, Cleaning Rework, Quality Inspection, Calibration Sign-off, Final Quality Sign-Off

    @Column(length = 100)
    private String processInstanceId;

    @Column(length = 50)
    private String requestId;

    @Column(length = 50)
    private String trayId;

    @Column(length = 100)
    private String assignee; // e.g., "tech_sarah_connor", unassigned

    @Column(nullable = false, length = 100)
    private String candidateGroup; // cssd-technician, qa-specialist, biomedical-engineering, qa-manager

    @Column(nullable = false, length = 50)
    private String priority; // NORMAL, HIGH, URGENT

    @Column(nullable = false, length = 50)
    private String status; // CREATED, ASSIGNED, COMPLETED

    private LocalDateTime dueDate = LocalDateTime.now().plusHours(4);

    @Column(length = 100)
    private String formKey;

    @Column(length = 2000)
    private String formPayloadJson;

    @Column(length = 2000)
    private String resultJson;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime completedAt;

    public WorkflowTask() {}

    public WorkflowTask(String taskId, String taskName, String processInstanceId, String requestId, 
                        String trayId, String assignee, String candidateGroup, String priority, 
                        String status, LocalDateTime dueDate, String formKey, String formPayloadJson) {
        this.taskId = taskId;
        this.taskName = taskName;
        this.processInstanceId = processInstanceId;
        this.requestId = requestId;
        this.trayId = trayId;
        this.assignee = assignee;
        this.candidateGroup = candidateGroup;
        this.priority = priority;
        this.status = status;
        this.dueDate = dueDate;
        this.formKey = formKey;
        this.formPayloadJson = formPayloadJson;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }
    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }
    public String getProcessInstanceId() { return processInstanceId; }
    public void setProcessInstanceId(String processInstanceId) { this.processInstanceId = processInstanceId; }
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public String getTrayId() { return trayId; }
    public void setTrayId(String trayId) { this.trayId = trayId; }
    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }
    public String getCandidateGroup() { return candidateGroup; }
    public void setCandidateGroup(String candidateGroup) { this.candidateGroup = candidateGroup; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public String getFormKey() { return formKey; }
    public void setFormKey(String formKey) { this.formKey = formKey; }
    public String getFormPayloadJson() { return formPayloadJson; }
    public void setFormPayloadJson(String formPayloadJson) { this.formPayloadJson = formPayloadJson; }
    public String getResultJson() { return resultJson; }
    public void setResultJson(String resultJson) { this.resultJson = resultJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}