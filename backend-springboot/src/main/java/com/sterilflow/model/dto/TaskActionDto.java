package com.sterilflow.model.dto;

import java.util.HashMap;
import java.util.Map;

public class TaskActionDto {
    private String taskId;
    private String assignee;
    private String action; // CLAIM, COMPLETE
    private Map<String, Object> variables = new HashMap<>();

    public TaskActionDto() {}

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }
    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public Map<String, Object> getVariables() { return variables; }
    public void setVariables(Map<String, Object> variables) { this.variables = variables; }
}