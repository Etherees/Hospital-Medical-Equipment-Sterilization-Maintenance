package com.sterilflow.controller;

import com.sterilflow.model.dto.ApiResponse;
import com.sterilflow.model.dto.TaskActionDto;
import com.sterilflow.model.entity.WorkflowTask;
import com.sterilflow.service.CustomTasklistService;
import com.sterilflow.service.WorkflowOrchestratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TasklistController {

    @Autowired
    private CustomTasklistService tasklistService;

    @Autowired
    private WorkflowOrchestratorService workflowService;

    @GetMapping
    public ApiResponse<List<WorkflowTask>> getAllTasks() {
        return ApiResponse.ok("All tasks retrieved", tasklistService.getAllTasks());
    }

    @GetMapping("/my")
    public ApiResponse<List<WorkflowTask>> getMyTasks(@RequestParam(required = false, defaultValue = "cssd-technician") String user) {
        return ApiResponse.ok("User tasks retrieved", tasklistService.getMyTasks(user));
    }

    @GetMapping("/unassigned")
    public ApiResponse<List<WorkflowTask>> getUnassignedTasks() {
        return ApiResponse.ok("Unassigned tasks retrieved", tasklistService.getUnassignedTasks());
    }

    @GetMapping("/completed")
    public ApiResponse<List<WorkflowTask>> getCompletedTasks() {
        return ApiResponse.ok("Completed tasks retrieved", tasklistService.getCompletedTasks());
    }

    @GetMapping("/overdue")
    public ApiResponse<List<WorkflowTask>> getOverdueTasks() {
        return ApiResponse.ok("Overdue tasks retrieved", tasklistService.getOverdueTasks());
    }

    @GetMapping("/{taskId}")
    public ApiResponse<WorkflowTask> getTask(@PathVariable String taskId) {
        return tasklistService.getTask(taskId)
                .map(ApiResponse::ok)
                .orElse(ApiResponse.error("Task not found: " + taskId));
    }

    @PostMapping("/{taskId}/complete")
    public ApiResponse<WorkflowTask> completeTask(
            @PathVariable String taskId,
            @RequestBody TaskActionDto dto) {
        WorkflowTask completed = workflowService.completeTask(taskId, dto.getAssignee(), dto.getVariables());
        return ApiResponse.ok("Task completed and process advanced", completed);
    }

    @PostMapping("/{taskId}/claim")
    public ApiResponse<WorkflowTask> claimTask(
            @PathVariable String taskId,
            @RequestBody TaskActionDto dto) {
        WorkflowTask claimed = workflowService.claimTask(taskId, dto.getAssignee());
        return ApiResponse.ok("Task claimed successfully", claimed);
    }
}