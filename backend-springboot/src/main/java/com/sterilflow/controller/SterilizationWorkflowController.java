package com.sterilflow.controller;

import com.sterilflow.model.dto.ApiResponse;
import com.sterilflow.model.dto.SterilizationRequestDto;
import com.sterilflow.model.entity.SterilizationRequest;
import com.sterilflow.model.entity.WorkflowTask;
import com.sterilflow.repository.SterilizationRequestRepository;
import com.sterilflow.service.CustomTasklistService;
import com.sterilflow.service.WorkflowOrchestratorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/workflows")
@CrossOrigin(origins = "*")
public class SterilizationWorkflowController {

    @Autowired
    private WorkflowOrchestratorService workflowService;

    @Autowired
    private SterilizationRequestRepository requestRepository;

    @Autowired
    private CustomTasklistService tasklistService;

    @PostMapping("/initiate")
    public ApiResponse<Map<String, Object>> initiateWorkflow(@Valid @RequestBody SterilizationRequestDto dto) {
        SterilizationRequest req = workflowService.initiateWorkflow(dto);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("requestId", req.getRequestId());
        responseData.put("processInstanceId", req.getProcessInstanceId());
        responseData.put("currentStage", req.getCurrentStage());
        responseData.put("status", req.getStatus());
        responseData.put("trayCount", req.getTrayCount());
        responseData.put("trackingUrl", "/workflows/" + req.getProcessInstanceId());

        return ApiResponse.ok("Workflow initiated successfully. Camunda Process Instance started.", responseData);
    }

    @GetMapping("/instances")
    public ApiResponse<List<SterilizationRequest>> getAllInstances() {
        return ApiResponse.ok("Workflow instances retrieved", requestRepository.findAllByOrderByStartedAtDesc());
    }

    @GetMapping("/{processInstanceId}")
    public ApiResponse<Map<String, Object>> getWorkflowDetails(@PathVariable String processInstanceId) {
        Optional<SterilizationRequest> reqOpt = requestRepository.findByProcessInstanceId(processInstanceId);
        if (reqOpt.isEmpty()) {
            return ApiResponse.error("Workflow process instance not found: " + processInstanceId);
        }

        SterilizationRequest req = reqOpt.get();
        List<WorkflowTask> tasks = tasklistService.getTasksByProcessInstance(processInstanceId);

        // Build 10-stage execution plan
        List<Map<String, Object>> stages = new ArrayList<>();
        String[] stageNames = {
            "Equipment Registration",
            "Initial Inspection",
            "Cleaning Verification",
            "Sterilization Initiation",
            "Autoclave Processing",
            "Chemical Indicator Verification",
            "Quality Inspection",
            "Calibration (if required)",
            "Final Approval",
            "Equipment Release"
        };
        String[] stageKeys = {
            "REGISTRATION",
            "INITIAL_INSPECTION",
            "CLEANING_VERIFICATION",
            "STERILIZATION_INITIATION",
            "AUTOCLAVE_PROCESSING",
            "CHEMICAL_INDICATOR_CHECK",
            "QUALITY_INSPECTION",
            "CALIBRATION",
            "FINAL_APPROVAL",
            "RELEASED"
        };

        int currentStageIdx = 1;
        for (int i = 0; i < stageKeys.length; i++) {
            if (stageKeys[i].equalsIgnoreCase(req.getCurrentStage())) {
                currentStageIdx = i;
                break;
            }
        }
        if ("COMPLETED".equals(req.getStatus())) {
            currentStageIdx = 9;
        }

        for (int i = 0; i < stageNames.length; i++) {
            Map<String, Object> stage = new HashMap<>();
            stage.put("stepNumber", i + 1);
            stage.put("name", stageNames[i]);
            stage.put("key", stageKeys[i]);

            if (i < currentStageIdx || "COMPLETED".equals(req.getStatus())) {
                stage.put("state", "COMPLETED");
            } else if (i == currentStageIdx && !"COMPLETED".equals(req.getStatus())) {
                stage.put("state", "ACTIVE");
            } else {
                stage.put("state", "PENDING");
            }
            stages.add(stage);
        }

        // Process variables
        Map<String, Object> variables = new HashMap<>();
        variables.put("requestId", req.getRequestId());
        variables.put("department", req.getDepartment());
        variables.put("operatingTheatre", req.getOperatingTheatre());
        variables.put("equipmentCategory", req.getEquipmentCategory());
        variables.put("equipmentId", req.getEquipmentId());
        variables.put("contaminationLevel", req.getContaminationLevel());
        variables.put("cleaningPassed", req.getCleaningPassed());
        variables.put("chemicalIndicatorPassed", req.getChemicalIndicatorPassed());
        variables.put("finalApprovalPassed", req.getFinalApprovalPassed());
        variables.put("trayCount", req.getTrayCount());
        variables.put("assignedTechnician", req.getAssignedTechnician());

        Map<String, Object> details = new HashMap<>();
        details.put("request", req);
        details.put("stages", stages);
        details.put("activeStageIndex", currentStageIdx);
        details.put("tasks", tasks);
        details.put("variables", variables);

        return ApiResponse.ok("Workflow tracking data retrieved", details);
    }
}