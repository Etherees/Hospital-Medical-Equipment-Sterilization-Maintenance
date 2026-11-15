package com.sterilflow.service;

import com.fasterxml.jackson.core.JsonProcessingException;
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
     * Start the Sterilization & Maintenance BPMN Process
     */
    @Transactional
    public SterilizationRequest initiateWorkflow(SterilizationRequestDto dto) {
        String requestId = "REQ-" + (System.currentTimeMillis() % 100000);
        String processInstanceId = "PI-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

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

        log.info("Started Sterilflow Process Instance {} with Request ID {}", processInstanceId, requestId);
        return req;
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

        if ("Initial Inspection".equalsIgnoreCase(taskName)) {
            boolean inspectionPassed = variables == null || !"false".equals(String.valueOf(variables.get("initialInspectionPassed")));
            req.setCleaningPassed(inspectionPassed);

            if (!inspectionPassed) {
                // Gateway: Cleaning Unsuccessful -> User Task Cleaning Rework
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
            } else {
                // Cleaning Passed -> Progress to Service Task Verify Cleaning & Parallel Multi-Instance
                executeMultiTraySterilizationPipeline(req);
            }
        } else if ("Cleaning Rework & Ultrasonic Wash".equalsIgnoreCase(taskName)) {
            req.setCleaningPassed(true);
            executeMultiTraySterilizationPipeline(req);
        } else if ("Quality Inspection".equalsIgnoreCase(taskName)) {
            // Evaluates tray quality & proceeds to Final Quality Sign-Off
            boolean qualPassed = variables == null || !"false".equals(String.valueOf(variables.get("approved")));
            req.setChemicalIndicatorPassed(qualPassed);

            req.setCurrentStage("FINAL_APPROVAL");
            requestRepository.save(req);

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
        } else if ("Final Quality Sign-Off".equalsIgnoreCase(taskName)) {
            boolean finalApproved = variables == null || !"false".equals(String.valueOf(variables.get("finalApprovalPassed")));
            req.setFinalApprovalPassed(finalApproved);

            if (finalApproved) {
                req.setCurrentStage("RELEASED");
                req.setStatus("COMPLETED");
                req.setCompletedAt(LocalDateTime.now());
                requestRepository.save(req);

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
                req.setCurrentStage("QUARANTINED");
                req.setStatus("QUARANTINED");
                requestRepository.save(req);

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