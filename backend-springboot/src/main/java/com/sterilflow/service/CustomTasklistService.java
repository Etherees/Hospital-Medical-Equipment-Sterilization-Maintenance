package com.sterilflow.service;

import com.sterilflow.model.entity.WorkflowTask;
import com.sterilflow.repository.WorkflowTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomTasklistService {

    @Autowired
    private WorkflowTaskRepository taskRepository;

    public List<WorkflowTask> getAllTasks() {
        return taskRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<WorkflowTask> getTask(String taskId) {
        return taskRepository.findByTaskId(taskId);
    }

    public List<WorkflowTask> getMyTasks(String assignee) {
        if (assignee == null || assignee.isBlank()) {
            return taskRepository.findByStatusOrderByCreatedAtDesc("ASSIGNED");
        }
        return taskRepository.findByAssigneeAndStatus(assignee, "ASSIGNED");
    }

    public List<WorkflowTask> getUnassignedTasks() {
        return taskRepository.findByStatusOrderByCreatedAtDesc("CREATED");
    }

    public List<WorkflowTask> getCompletedTasks() {
        return taskRepository.findByStatusOrderByCreatedAtDesc("COMPLETED");
    }

    public List<WorkflowTask> getOverdueTasks() {
        LocalDateTime now = LocalDateTime.now();
        return taskRepository.findAll().stream()
                .filter(t -> !"COMPLETED".equals(t.getStatus()) && t.getDueDate() != null && t.getDueDate().isBefore(now))
                .collect(Collectors.toList());
    }

    public List<WorkflowTask> getTasksByProcessInstance(String processInstanceId) {
        return taskRepository.findByProcessInstanceId(processInstanceId);
    }
}