package com.sterilflow.repository;

import com.sterilflow.model.entity.WorkflowTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkflowTaskRepository extends JpaRepository<WorkflowTask, Long> {
    Optional<WorkflowTask> findByTaskId(String taskId);
    List<WorkflowTask> findByStatusOrderByCreatedAtDesc(String status);
    List<WorkflowTask> findByAssigneeAndStatus(String assignee, String status);
    List<WorkflowTask> findByCandidateGroupAndStatus(String group, String status);
    List<WorkflowTask> findByProcessInstanceId(String processInstanceId);
    List<WorkflowTask> findAllByOrderByCreatedAtDesc();
}