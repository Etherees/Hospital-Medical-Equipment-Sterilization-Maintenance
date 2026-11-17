package com.sterilflow.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
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

    private final ObjectMapper objectMapper = new ObjectMapper();

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
        responseData.put("camundaOperateUrl", "http://localhost:8080/operate/processes/" + req.getProcessInstanceId());

        return ApiResponse.ok("Workflow initiated successfully. Camunda Process Instance started.", responseData);
    }

    @PostMapping("/sync-step")
    public ApiResponse<Map<String, Object>> syncStep(@RequestBody Map<String, Object> body) {
        String processInstanceId = String.valueOf(body.get("processInstanceId"));
        String elementId = body.get("elementId") != null ? String.valueOf(body.get("elementId")) : "";
        String status = body.get("status") != null ? String.valueOf(body.get("status")) : "IN_PROGRESS";

        Optional<SterilizationRequest> reqOpt = requestRepository.findByProcessInstanceId(processInstanceId);
        SterilizationRequest req;
        if (reqOpt.isPresent()) {
            req = reqOpt.get();
        } else {
            req = new SterilizationRequest();
            req.setProcessInstanceId(processInstanceId);
            req.setRequestId(body.get("requestId") != null ? String.valueOf(body.get("requestId")) : "REQ-" + (System.currentTimeMillis() % 100000));
            req.setDepartment(body.get("department") != null ? String.valueOf(body.get("department")) : "Surgery");
            req.setOperatingTheatre(body.get("operatingTheatre") != null ? String.valueOf(body.get("operatingTheatre")) : "OR-1");
            req.setEquipmentCategory(body.get("equipmentCategory") != null ? String.valueOf(body.get("equipmentCategory")) : "Surgical instrument trays");
            req.setEquipmentId(body.get("equipmentId") != null ? String.valueOf(body.get("equipmentId")) : "EQ-TRAY-001");
            req.setAssignedTechnician(body.get("assignedTechnician") != null ? String.valueOf(body.get("assignedTechnician")) : "tech_sarah_connor");
            req.setPriority("HIGH");
            req.setTrayCount(1);
            req.setStatus("IN_PROGRESS");
            req.setStartedAt(LocalDateTime.now());
        }

        // Map BPMN element to 10-stage execution plan
        if ("Task_RegisterEquipment".equalsIgnoreCase(elementId)) {
            req.setCurrentStage("INITIAL_INSPECTION");
        } else if ("Task_InitialInspection".equalsIgnoreCase(elementId)) {
            req.setCurrentStage("CLEANING_VERIFICATION");
        } else if ("Task_VerifyCleaning".equalsIgnoreCase(elementId)) {
            req.setCurrentStage("STERILIZATION_INITIATION");
        } else if ("Task_ExecuteSterilizationCycle".equalsIgnoreCase(elementId)) {
            req.setCurrentStage("AUTOCLAVE_PROCESSING");
        } else if ("Task_VerifyChemicalIndicator".equalsIgnoreCase(elementId)) {
            req.setCurrentStage("CHEMICAL_INDICATOR_CHECK");
        } else if ("Task_QualityInspection".equalsIgnoreCase(elementId)) {
            req.setCurrentStage("QUALITY_INSPECTION");
        } else if ("CallActivity_BiomedicalCalibration".equalsIgnoreCase(elementId)) {
            req.setCurrentStage("CALIBRATION");
        } else if ("Task_FinalQualitySignoff".equalsIgnoreCase(elementId)) {
            req.setCurrentStage("FINAL_APPROVAL");
        } else if ("Task_UpdateEquipmentStatus".equalsIgnoreCase(elementId) 
                || "Task_GenerateSterilizationCert".equalsIgnoreCase(elementId) 
                || "Task_SendNotification".equalsIgnoreCase(elementId)
                || "COMPLETED".equalsIgnoreCase(status)) {
            req.setCurrentStage("RELEASED");
            req.setStatus("COMPLETED");
            req.setCompletedAt(LocalDateTime.now());
        }

        requestRepository.save(req);
        Map<String, Object> res = new HashMap<>();
        res.put("processInstanceId", processInstanceId);
        res.put("stage", req.getCurrentStage());
        res.put("status", req.getStatus());
        return ApiResponse.ok("Stage synchronized successfully", res);
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

        // Check live Camunda 8 cluster status if not yet completed
        if (!"COMPLETED".equalsIgnoreCase(req.getStatus()) && req.getProcessInstanceId() != null && req.getProcessInstanceId().matches("\\d+")) {
            try {
                HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(600)).build();
                HttpRequest camundaReq = HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:8080/v2/process-instances/" + req.getProcessInstanceId()))
                        .timeout(Duration.ofMillis(1000))
                        .GET()
                        .build();
                HttpResponse<String> resp = client.send(camundaReq, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() == 200) {
                    JsonNode node = objectMapper.readTree(resp.body());
                    String state = node.has("state") ? node.get("state").asText() : "";
                    if ("COMPLETED".equalsIgnoreCase(state)) {
                        req.setStatus("COMPLETED");
                        req.setCurrentStage("RELEASED");
                        req.setCompletedAt(LocalDateTime.now());
                        requestRepository.save(req);
                    }
                }
            } catch (Exception ignored) {}
        }

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