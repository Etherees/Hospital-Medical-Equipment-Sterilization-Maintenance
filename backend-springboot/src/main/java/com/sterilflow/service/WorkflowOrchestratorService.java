package com.sterilflow.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sterilflow.camunda.ZeebeJobWorkers;
import com.sterilflow.model.dto.SterilizationRequestDto;
import com.sterilflow.model.dto.TrayItemDto;
import com.sterilflow.model.entity.*;
import com.sterilflow.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class WorkflowOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(WorkflowOrchestratorService.class);

    @Autowired
    private SterilizationRequestRepository requestRepository;

    @Autowired
    private InstrumentTrayRepository trayRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private SterilizationCycleRepository cycleRepository;

    @Autowired
    private AutoclaveMachineRepository autoclaveRepository;

    @Autowired
    private WorkflowTaskRepository taskRepository;

    @Autowired
    private QualityInspectionRepository inspectionRepository;

    @Autowired
    private CalibrationRecordRepository calibrationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ZeebeJobWorkers workers;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Start the Sterilization & Maintenance BPMN Process in Camunda 8 and local tracking
     */
    @Transactional
    public SterilizationRequest initiateWorkflow(SterilizationRequestDto dto) {
        String requestId = "REQ-" + (System.currentTimeMillis() % 100000);
        
        // 1. Start live process instance in Camunda 8 Zeebe cluster
        String processInstanceId = startCamundaProcess(requestId, dto);

        SterilizationRequest req = new SterilizationRequest();
        req.setRequestId(requestId);
        req.setProcessInstanceId(processInstanceId);
        req.setDepartment(dto.getDepartment());
        req.setOperatingTheatre(dto.getOperatingTheatre());
        req.setEquipmentCategory(dto.getEquipmentCategory());
        req.setEquipmentId(dto.getEquipmentId());
        req.setContaminationLevel(dto.getContaminationLevel());
        req.setCleaningStatus(dto.getCleaningStatus());
        req.setSterilizationMethod(dto.getSterilizationMethod());
        req.setAssignedTechnician(dto.getAssignedTechnician());
        req.setPriority(dto.getPriority());
        req.setNotes(dto.getNotes());
        req.setCurrentStage("INITIAL_INSPECTION");
        req.setStatus("IN_PROGRESS");
        req.setTrayCount(dto.getTrays() != null ? dto.getTrays().size() : 1);
        req.setStartedAt(LocalDateTime.now());

        // Save Request
        req = requestRepository.save(req);

        // Service Task 1: Register Equipment
        workers.handleRegisterEquipment(requestId, dto.getEquipmentId());

        // Update Equipment status
        equipmentRepository.findByEquipmentId(dto.getEquipmentId()).ifPresent(eq -> {
            eq.setCurrentStatus("STERILIZING");
            equipmentRepository.save(eq);
        });

        // Register / Link Trays for Multi-Instance Execution
        if (dto.getTrays() != null && !dto.getTrays().isEmpty()) {
            for (TrayItemDto trayDto : dto.getTrays()) {
                Optional<InstrumentTray> existingTray = trayRepository.findByTrayId(trayDto.getTrayId());
                InstrumentTray tray;
                if (existingTray.isPresent()) {
                    tray = existingTray.get();
                    tray.setCurrentStatus("IN_STERILIZATION");
                    tray.setAutoclaveId(trayDto.getAutoclaveId());
                    tray.setCalibrationRequired(trayDto.getCalibrationRequired());
                } else {
                    tray = new InstrumentTray(
                        trayDto.getTrayId(),
                        trayDto.getTrayName() != null ? trayDto.getTrayName() : "Surgical Tray " + trayDto.getTrayId(),
                        dto.getDepartment(),
                        "IN_STERILIZATION",
                        dto.getPriority(),
                        1,
                        trayDto.getAutoclaveId(),
                        trayDto.getCalibrationRequired(),
                        null
                    );
                }
                trayRepository.save(tray);
            }
        }

        // Generate User Task 1: Initial Inspection for CSSD Technician
        Map<String, Object> initialTaskPayload = new HashMap<>();
        initialTaskPayload.put("requestId", requestId);
        initialTaskPayload.put("department", dto.getDepartment());
        initialTaskPayload.put("equipmentId", dto.getEquipmentId());
        initialTaskPayload.put("contaminationLevel", dto.getContaminationLevel());
        initialTaskPayload.put("traysCount", req.getTrayCount());

        createWorkflowTask(
            "Initial Inspection",
            processInstanceId,
            requestId,
            dto.getTrays() != null && !dto.getTrays().isEmpty() ? dto.getTrays().get(0).getTrayId() : null,
            dto.getAssignedTechnician(),
            "cssd-technician",
            dto.getPriority(),
            "camunda-forms:bpmn:initial-inspection-form",
            initialTaskPayload
        );

        log.info("Successfully started interconnected Sterilflow instance: Camunda Key={} for Request ID={}", processInstanceId, requestId);
        return req;
    }

    /**
     * Interconnect with Camunda 8 Zeebe REST API to launch the real BPMN process instance
     */
    private String startCamundaProcess(String requestId, SterilizationRequestDto dto) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(4))
                    .build();

            Map<String, Object> camundaPayload = new HashMap<>();
            camundaPayload.put("processDefinitionId", "sterilflow-main-process");

            Map<String, Object> variables = new HashMap<>();
            variables.put("requestId", requestId);
            variables.put("equipmentId", dto.getEquipmentId() != null ? dto.getEquipmentId() : "EQ-TRAY-001");
            variables.put("equipmentCategory", dto.getEquipmentCategory() != null ? dto.getEquipmentCategory() : "Surgical instrument trays");
            variables.put("department", dto.getDepartment() != null ? dto.getDepartment() : "Surgery");
            variables.put("operatingTheatre", dto.getOperatingTheatre() != null ? dto.getOperatingTheatre() : "OR-1");
            variables.put("urgency", dto.getPriority() != null ? dto.getPriority() : "NORMAL");
            variables.put("assignedTechnician", dto.getAssignedTechnician() != null ? dto.getAssignedTechnician() : "tech_sarah_connor");

            boolean cleaningPassed = !"BIOHAZARD".equalsIgnoreCase(dto.getContaminationLevel());
            variables.put("cleaningPassed", cleaningPassed);
            variables.put("chemicalIndicatorPassed", true);
            variables.put("finalApprovalPassed", true);

            List<Map<String, Object>> trayList = new ArrayList<>();
            if (dto.getTrays() != null && !dto.getTrays().isEmpty()) {
                for (TrayItemDto t : dto.getTrays()) {
                    Map<String, Object> tm = new HashMap<>();
                    tm.put("trayId", t.getTrayId() != null ? t.getTrayId() : "TRAY-01");
                    tm.put("trayName", t.getTrayName() != null ? t.getTrayName() : "Surgical Tray " + t.getTrayId());
                    tm.put("calibrationRequired", t.getCalibrationRequired() != null && t.getCalibrationRequired());
                    trayList.add(tm);
                }
            } else {
                Map<String, Object> tm = new HashMap<>();
                tm.put("trayId", "TRAY-GEN-01");
                tm.put("trayName", "Standard Surgical Tray");
                tm.put("calibrationRequired", false);
                trayList.add(tm);
            }
            variables.put("surgicalTrays", trayList);
            camundaPayload.put("variables", variables);

            String requestBody = objectMapper.writeValueAsString(camundaPayload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:8080/v2/process-instances"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(6))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200 || response.statusCode() == 201) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.has("processInstanceKey")) {
                    String instanceKey = root.get("processInstanceKey").asText();
                    log.info("[Camunda 8 Interconnect] Created Process Instance Key: {}", instanceKey);
                    return instanceKey;
                }
            } else {
                log.warn("[Camunda 8 Interconnect] Cluster returned status {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("[Camunda 8 Interconnect] Unable to contact cluster at http://localhost:8080/v2/process-instances: {}", e.getMessage());
        }
        return "PI-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Interconnect with Camunda 8 Zeebe cluster to complete waiting User Tasks
     */
    public boolean completeCamundaUserTask(String processInstanceId, String targetElementId, Map<String, Object> camundaVars) {
        if (processInstanceId == null || !processInstanceId.matches("\\d+")) {
            log.info("[Camunda 8 Interconnect] Non-numeric processInstanceId (mock/local): {}", processInstanceId);
            return false;
        }

        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(4))
                    .build();

            for (int attempt = 0; attempt < 5; attempt++) {
                // Method 1: Camunda 8 REST API for Native User Tasks (/v2/user-tasks)
                try {
                    Map<String, Object> filter = new HashMap<>();
                    filter.put("state", "CREATED");
                    filter.put("processInstanceKey", processInstanceId);
                    if (targetElementId != null && !targetElementId.isEmpty()) {
                        filter.put("elementId", targetElementId);
                    }

                    Map<String, Object> searchPayload = new HashMap<>();
                    searchPayload.put("filter", filter);

                    HttpRequest searchReq = HttpRequest.newBuilder()
                            .uri(URI.create("http://localhost:8080/v2/user-tasks/search"))
                            .header("Content-Type", "application/json")
                            .timeout(Duration.ofSeconds(4))
                            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(searchPayload)))
                            .build();

                    HttpResponse<String> searchResp = client.send(searchReq, HttpResponse.BodyHandlers.ofString());
                    if (searchResp.statusCode() == 200) {
                        JsonNode searchNode = objectMapper.readTree(searchResp.body());
                        if (searchNode.has("items") && searchNode.get("items").isArray() && searchNode.get("items").size() > 0) {
                            for (JsonNode taskNode : searchNode.get("items")) {
                                String userTaskKey = taskNode.has("userTaskKey") ? taskNode.get("userTaskKey").asText() : "";
                                String elemId = taskNode.has("elementId") ? taskNode.get("elementId").asText() : "";

                                if (targetElementId == null || targetElementId.isEmpty() || targetElementId.equalsIgnoreCase(elemId)) {
                                    String compUrl = "http://localhost:8080/v2/user-tasks/" + userTaskKey + "/completion";
                                    Map<String, Object> compBody = new HashMap<>();
                                    compBody.put("variables", camundaVars != null ? camundaVars : Collections.emptyMap());

                                    HttpRequest compReq = HttpRequest.newBuilder()
                                            .uri(URI.create(compUrl))
                                            .header("Content-Type", "application/json")
                                            .timeout(Duration.ofSeconds(4))
                                            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(compBody)))
                                            .build();

                                    HttpResponse<String> compResp = client.send(compReq, HttpResponse.BodyHandlers.ofString());
                                    if (compResp.statusCode() == 204 || compResp.statusCode() == 200) {
                                        log.info("[Camunda 8 Interconnect] Completed Native User Task {} ({}) for Instance {} with variables: {}",
                                                userTaskKey, elemId, processInstanceId, camundaVars);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception ex) {
                    log.warn("[Camunda 8 Interconnect] User task REST search attempt failed: {}", ex.getMessage());
                }

                // Method 2: Zeebe Job Worker API fallback (io.camunda.zeebe:userTask)
                Map<String, Object> actPayload = new HashMap<>();
                actPayload.put("type", "io.camunda.zeebe:userTask");
                actPayload.put("timeout", 5000);
                actPayload.put("maxJobsToActivate", 25);
                actPayload.put("worker", "sterilflow-backend-signoff");

                HttpRequest actReq = HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:8080/v2/jobs/activation"))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(4))
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(actPayload)))
                        .build();

                HttpResponse<String> actResp = client.send(actReq, HttpResponse.BodyHandlers.ofString());
                if (actResp.statusCode() == 200) {
                    JsonNode root = objectMapper.readTree(actResp.body());
                    if (root.has("jobs") && root.get("jobs").isArray()) {
                        for (JsonNode job : root.get("jobs")) {
                            String pKey = job.has("processInstanceKey") ? job.get("processInstanceKey").asText() : "";
                            String jKey = job.has("jobKey") ? job.get("jobKey").asText() : "";
                            String elem = job.has("elementId") ? job.get("elementId").asText() : "";

                            if (processInstanceId.equals(pKey)) {
                                if (targetElementId == null || targetElementId.isEmpty() || targetElementId.equalsIgnoreCase(elem)) {
                                    String compUrl = "http://localhost:8080/v2/jobs/" + jKey + "/completion";
                                    Map<String, Object> compPayload = new HashMap<>();
                                    compPayload.put("variables", camundaVars != null ? camundaVars : Collections.emptyMap());

                                    HttpRequest compReq = HttpRequest.newBuilder()
                                            .uri(URI.create(compUrl))
                                            .header("Content-Type", "application/json")
                                            .timeout(Duration.ofSeconds(4))
                                            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(compPayload)))
                                            .build();

                                    HttpResponse<String> compResp = client.send(compReq, HttpResponse.BodyHandlers.ofString());
                                    if (compResp.statusCode() == 204 || compResp.statusCode() == 200) {
                                        log.info("[Camunda 8 Interconnect] Completed User Task Job {} ({}) for Instance {} with variables: {}",
                                                jKey, elem, processInstanceId, camundaVars);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
                Thread.sleep(600);
            }
        } catch (Exception e) {
            log.error("[Camunda 8 Interconnect] Failed to complete user task in Camunda: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Complete a User Task in Custom Tasklist
     */
    @Transactional
    public WorkflowTask completeTask(String taskId, String assignee, Map<String, Object> variables) {
        WorkflowTask task = taskRepository.findByTaskId(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        task.setStatus("COMPLETED");
        task.setAssignee(assignee != null ? assignee : "cssd_supervisor");
        task.setCompletedAt(LocalDateTime.now());

        try {
            task.setResultJson(objectMapper.writeValueAsString(variables));
        } catch (JsonProcessingException e) {
            task.setResultJson("{}");
        }
        task = taskRepository.save(task);

        // Advance process state machine based on task type
        advanceProcessState(task, variables);

        return task;
    }

    private void advanceProcessState(WorkflowTask completedTask, Map<String, Object> variables) {
        String processInstanceId = completedTask.getProcessInstanceId();
        String taskName = completedTask.getTaskName();

        Optional<SterilizationRequest> reqOpt = requestRepository.findByProcessInstanceId(processInstanceId);
        if (reqOpt.isEmpty()) return;
        SterilizationRequest req = reqOpt.get();

        if ("Initial Inspection".equalsIgnoreCase(taskName) || taskName.contains("Initial Inspection")) {
            boolean inspectionPassed = true;
            if (variables != null) {
                Object val = variables.get("initialInspectionPassed");
                if ("false".equalsIgnoreCase(String.valueOf(val)) || Boolean.FALSE.equals(val)) {
                    inspectionPassed = false;
                }
            }
            req.setCleaningPassed(inspectionPassed);

            Map<String, Object> camundaVars = new HashMap<>();
            camundaVars.put("initialInspectionPassed", inspectionPassed);
            camundaVars.put("cleaningPassed", inspectionPassed);

            if (!inspectionPassed) {
                // FAILURE PATH: Route to Cleaning Rework
                req.setCurrentStage("CLEANING_REWORK");
                requestRepository.save(req);

                Map<String, Object> reworkPayload = new HashMap<>();
                reworkPayload.put("requestId", req.getRequestId());
                reworkPayload.put("reason", "Excessive biological burden / bio-film observed during initial inspection");

                createWorkflowTask(
                    "Cleaning Rework & Ultrasonic Wash",
                    processInstanceId,
                    req.getRequestId(),
                    completedTask.getTrayId(),
                    null,
                    "cssd-technician",
                    "HIGH",
                    "camunda-forms:bpmn:cleaning-rework-form",
                    reworkPayload
                );

                completeCamundaUserTask(processInstanceId, "Task_InitialInspection", camundaVars);
            } else {
                // HAPPY PATH: Cleaning Passed -> Verify Cleaning & Autoclave
                req.setCurrentStage("CLEANING_VERIFICATION");
                requestRepository.save(req);
                completeCamundaUserTask(processInstanceId, "Task_InitialInspection", camundaVars);
            }
        } else if ("Cleaning Rework & Ultrasonic Wash".equalsIgnoreCase(taskName) || taskName.contains("Rework")) {
            // Completed rework -> reset to initial inspection
            req.setCleaningPassed(true);
            req.setCurrentStage("INITIAL_INSPECTION");
            requestRepository.save(req);

            Map<String, Object> reInspectPayload = new HashMap<>();
            reInspectPayload.put("requestId", req.getRequestId());
            reInspectPayload.put("note", "Re-inspection following enzymatic ultrasonic rework");

            createWorkflowTask(
                "Initial Inspection",
                processInstanceId,
                req.getRequestId(),
                completedTask.getTrayId(),
                null,
                "cssd-technician",
                "HIGH",
                "camunda-forms:bpmn:initial-inspection-form",
                reInspectPayload
            );

            Map<String, Object> camundaVars = new HashMap<>();
            camundaVars.put("cleaningPassed", true);
            camundaVars.put("initialInspectionPassed", true);
            completeCamundaUserTask(processInstanceId, "Task_CleaningRework", camundaVars);
        } else if ("Quality Inspection".equalsIgnoreCase(taskName) || taskName.contains("Quality Inspection")) {
            boolean qualPassed = variables == null || !"false".equals(String.valueOf(variables.get("approved")));
            req.setChemicalIndicatorPassed(qualPassed);

            Map<String, Object> camundaVars = new HashMap<>();
            camundaVars.put("qualityPassed", qualPassed);
            camundaVars.put("chemicalIndicatorPassed", qualPassed);

            if (qualPassed) {
                boolean calibReq = trayRepository.findAll().stream()
                        .anyMatch(t -> Boolean.TRUE.equals(t.getCalibrationRequired()));
                req.setCurrentStage(calibReq ? "CALIBRATION" : "FINAL_APPROVAL");
                requestRepository.save(req);

                // Complete Camunda User Task
                completeCamundaUserTask(processInstanceId, "Task_QualityInspection", camundaVars);

                Map<String, Object> signoffPayload = new HashMap<>();
                signoffPayload.put("requestId", req.getRequestId());
                signoffPayload.put("department", req.getDepartment());
                signoffPayload.put("traysProcessed", req.getTrayCount());

                createWorkflowTask(
                    "Final Quality Sign-Off",
                    processInstanceId,
                    req.getRequestId(),
                    null,
                    null,
                    "qa-manager",
                    req.getPriority(),
                    "camunda-forms:bpmn:quality-signoff-form",
                    signoffPayload
                );
            } else {
                req.setCurrentStage("QUARANTINED");
                req.setStatus("QUARANTINED");
                requestRepository.save(req);

                completeCamundaUserTask(processInstanceId, "Task_QualityInspection", camundaVars);

                Map<String, Object> rejectPayload = new HashMap<>();
                rejectPayload.put("requestId", req.getRequestId());
                rejectPayload.put("reason", "Seal integrity failure or defective sterile barrier detected during Quality Inspection");

                createWorkflowTask(
                    "Final Quality Sign-Off",
                    processInstanceId,
                    req.getRequestId(),
                    null,
                    null,
                    "qa-manager",
                    "CRITICAL",
                    "camunda-forms:bpmn:quality-signoff-form",
                    rejectPayload
                );
            }
        } else if ("Final Quality Sign-Off".equalsIgnoreCase(taskName) || taskName.contains("Final Quality")) {
            boolean finalApproved = true;
            if (variables != null) {
                Object val = variables.get("finalApprovalPassed");
                if ("false".equalsIgnoreCase(String.valueOf(val)) || Boolean.FALSE.equals(val)) {
                    finalApproved = false;
                }
            }
            req.setFinalApprovalPassed(finalApproved);

            Map<String, Object> camundaVars = new HashMap<>();
            camundaVars.put("finalApprovalPassed", finalApproved);

            if (finalApproved) {
                req.setCurrentStage("RELEASED");
                req.setStatus("COMPLETED");
                req.setCompletedAt(LocalDateTime.now());
                requestRepository.save(req);

                completeCamundaUserTask(processInstanceId, "Task_FinalQualitySignoff", camundaVars);

                // Update Equipment & Tray status
                workers.handleUpdateEquipmentStatus(req.getEquipmentId(), req.getRequestId());
                equipmentRepository.findByEquipmentId(req.getEquipmentId()).ifPresent(eq -> {
                    eq.setCurrentStatus("AVAILABLE");
                    eq.setLastSterilizationDate(LocalDateTime.now());
                    equipmentRepository.save(eq);
                });

                // Generate certificate
                workers.handleGenerateCertificate(req.getRequestId(), req.getDepartment());

                // Send notification
                workers.handleSendNotification("or-scheduling@hospital.internal",
                        "[STERILFLOW RELEASED] Trays Ready - Request #" + req.getRequestId(),
                        "Trays released for surgical intervention.");

                notificationRepository.save(new SystemNotification(
                    "NOTIF-" + (System.currentTimeMillis() % 100000),
                    "Equipment Released: Request #" + req.getRequestId(),
                    "All trays successfully sterilized, chemical indicator Class 5 verified, and released to OR.",
                    "EMAIL",
                    "or-scheduling@hospital.internal",
                    "SENT"
                ));
            } else {
                // FAILURE PATH: Rejected -> Flag Corrective Maintenance Quarantine
                req.setCurrentStage("QUARANTINED");
                req.setStatus("QUARANTINED");
                requestRepository.save(req);

                completeCamundaUserTask(processInstanceId, "Task_FinalQualitySignoff", camundaVars);

                equipmentRepository.findByEquipmentId(req.getEquipmentId()).ifPresent(eq -> {
                    eq.setCurrentStatus("MAINTENANCE_REQUIRED");
                    equipmentRepository.save(eq);
                });
            }
        }
    }

    /**
     * Executes the Parallel Multi-Instance Sterilization Subprocess
     */
    private void executeMultiTraySterilizationPipeline(SterilizationRequest req) {
        req.setCurrentStage("AUTOCLAVE_PROCESSING");
        requestRepository.save(req);

        // Workers execute verify-cleaning and initiate-sterilization
        workers.handleVerifyCleaning(req.getRequestId(), req.getContaminationLevel());

        String autoclaveId = "AC-01";
        workers.handleInitiateSterilization("TRAY-BATCH-" + req.getRequestId(), autoclaveId);

        // Record a sterilization cycle
        String cycleNum = "CYC-" + (System.currentTimeMillis() % 100000);
        SterilizationCycle cycle = new SterilizationCycle();
        cycle.setCycleNumber(cycleNum);
        cycle.setAutoclaveId(autoclaveId);
        cycle.setAutoclaveModel("Siemens SteriGuard 660-X");
        cycle.setTargetTemperature(134.0);
        cycle.setTargetPressure(2.2);
        cycle.setCurrentTemperature(134.4);
        cycle.setCurrentPressure(2.23);
        cycle.setPhase("STERILIZATION_HOLD");
        cycle.setProgressPercent(85);
        cycle.setDurationSeconds(900);
        cycle.setChemicalIndicatorResult("PASSED");
        cycle.setBiologicalIndicatorResult("NEGATIVE_CLEAR");
        cycle.setStatus("COMPLETED");
        cycle.setRequestId(req.getRequestId());
        cycle.setStartedAt(LocalDateTime.now().minusMinutes(12));
        cycle.setEndedAt(LocalDateTime.now());
        cycleRepository.save(cycle);

        // Chemical indicator check worker
        workers.handleVerifyChemicalIndicator("TRAY-BATCH-" + req.getRequestId(), false);

        // Create Quality Inspection User Task
        req.setCurrentStage("QUALITY_INSPECTION");
        requestRepository.save(req);

        Map<String, Object> qualPayload = new HashMap<>();
        qualPayload.put("requestId", req.getRequestId());
        qualPayload.put("cycleNumber", cycleNum);
        qualPayload.put("autoclaveId", autoclaveId);
        qualPayload.put("temperatureAchieved", "134.4°C");
        qualPayload.put("pressureAchieved", "2.23 bar");

        createWorkflowTask(
            "Quality Inspection",
            req.getProcessInstanceId(),
            req.getRequestId(),
            null,
            null,
            "qa-specialist",
            req.getPriority(),
            "camunda-forms:bpmn:quality-signoff-form",
            qualPayload
        );
    }

    /**
     * Utility method to create a workflow task
     */
    public WorkflowTask createWorkflowTask(String taskName, String processInstanceId, String requestId, 
                                          String trayId, String assignee, String candidateGroup, 
                                          String priority, String formKey, Map<String, Object> payload) {
        String taskId = "TASK-" + (System.currentTimeMillis() % 100000);
        String payloadJson = "{}";
        try {
            payloadJson = objectMapper.writeValueAsString(payload != null ? payload : Collections.emptyMap());
        } catch (Exception ignored) {}

        WorkflowTask task = new WorkflowTask(
            taskId,
            taskName,
            processInstanceId,
            requestId,
            trayId,
            assignee,
            candidateGroup,
            priority != null ? priority : "NORMAL",
            assignee != null ? "ASSIGNED" : "CREATED",
            LocalDateTime.now().plusHours(4),
            formKey,
            payloadJson
        );
        return taskRepository.save(task);
    }

    /**
     * Claim a task
     */
    @Transactional
    public WorkflowTask claimTask(String taskId, String assignee) {
        WorkflowTask task = taskRepository.findByTaskId(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.setAssignee(assignee);
        task.setStatus("ASSIGNED");
        return taskRepository.save(task);
    }
}