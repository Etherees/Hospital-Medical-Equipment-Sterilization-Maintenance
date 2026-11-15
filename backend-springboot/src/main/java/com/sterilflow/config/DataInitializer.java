package com.sterilflow.config;

import com.sterilflow.model.entity.*;
import com.sterilflow.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private InstrumentTrayRepository trayRepository;

    @Autowired
    private InstrumentRepository instrumentRepository;

    @Autowired
    private AutoclaveMachineRepository autoclaveRepository;

    @Autowired
    private SterilizationRequestRepository requestRepository;

    @Autowired
    private SterilizationCycleRepository cycleRepository;

    @Autowired
    private WorkflowTaskRepository taskRepository;

    @Autowired
    private CalibrationRecordRepository calibrationRepository;

    @Autowired
    private MaintenanceRecordRepository maintenanceRepository;

    @Autowired
    private QualityInspectionRepository inspectionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing STERILFLOW High-Fidelity Medical Technology Seed Data...");

        // 1. Autoclave Machines
        AutoclaveMachine ac1 = new AutoclaveMachine(
            "AC-01", "Siemens SteriGuard 660-X", "STERILIZING", 134.2, 2.22, false, 1420, 6
        );
        ac1.setCurrentCycleNumber("CYC-2026-1042");
        ac1.setCurrentPhase("STERILIZATION_HOLD");
        ac1.setCycleProgressPercent(78);
        autoclaveRepository.save(ac1);

        AutoclaveMachine ac2 = new AutoclaveMachine(
            "AC-02", "Getinge GSS67H Steam Sterilizer", "IDLE", 24.5, 1.01, true, 890, 8
        );
        autoclaveRepository.save(ac2);

        AutoclaveMachine ac3 = new AutoclaveMachine(
            "AC-03", "SteriFlow Plasma Ion Low-Temp 45°C", "IDLE", 45.0, 0.45, true, 340, 4
        );
        autoclaveRepository.save(ac3);

        // 2. Equipment
        Equipment eqTray = new Equipment(
            "EQ-TRAY-001",
            "Aesculap Orthopedic Major Joint Reconstruction Tray Set",
            "Surgical instrument trays",
            "B. Braun / Aesculap",
            "JN-442R Ortho-Pro",
            "SN-AES-889104",
            "CSSD Bay 4 - Rack 2",
            "AVAILABLE",
            LocalDateTime.now().minusDays(1),
            LocalDateTime.now().plusMonths(3),
            "VALID",
            "{\"weightKg\": 8.4, \"trayStandard\": \"DIN 58952\", \"maxTemp\": \"141°C\", \"instrumentsIncluded\": 28, \"rfidTag\": \"RFID-9921-A\"}"
        );
        equipmentRepository.save(eqTray);

        Equipment eqImaging = new Equipment(
            "EQ-IMG-002",
            "Siemens Cios Alpha Mobile C-Arm Fluoroscopy System",
            "Diagnostic imaging equipment",
            "Siemens Healthineers",
            "Cios Alpha 25kW FD",
            "SN-CIOS-90214",
            "Operating Theatre OR-1",
            "AVAILABLE",
            LocalDateTime.now().minusDays(5),
            LocalDateTime.now().plusMonths(6),
            "VALID",
            "{\"detectorType\": \"CMOS Flat Detector 30x30cm\", \"anodeHeatStorage\": \"1.5 MHU\", \"kVRange\": \"40-125 kV\", \"laserAimer\": true}"
        );
        equipmentRepository.save(eqImaging);

        Equipment eqEndo = new Equipment(
            "EQ-ENDO-003",
            "Karl Storz Image1 S 4K Laparoscopy Tower",
            "Endoscopy equipment",
            "Karl Storz Endoskope",
            "Image1 S 4K Rubina",
            "SN-KS-77412",
            "Endoscopy Suite B",
            "AVAILABLE",
            LocalDateTime.now().minusDays(2),
            LocalDateTime.now().plusMonths(4),
            "VALID",
            "{\"resolution\": \"3840x2160 4K UHD\", \"lightSource\": \"Power LED 300\", \"cameraCoupler\": \"Pendual Full HD\", \"autoclavableScopes\": true}"
        );
        equipmentRepository.save(eqEndo);

        Equipment eqTools = new Equipment(
            "EQ-TOOL-004",
            "Stryker System 8 Cordless Precision Surgical Saw & Drill",
            "Surgical tools",
            "Stryker Orthopaedics",
            "System 8 Cordless 8205",
            "SN-STR-55421",
            "Orthopedic Prep Room",
            "AVAILABLE",
            LocalDateTime.now().minusDays(1),
            LocalDateTime.now().plusMonths(2),
            "VALID",
            "{\"speedRpm\": 12000, \"batteryTech\": \"Sterile Lithium-Ion LiFePO4\", \"ipRating\": \"IPX9K Submersible\", \"cannulated\": true}"
        );
        equipmentRepository.save(eqTools);

        Equipment eqMon = new Equipment(
            "EQ-MON-005",
            "Philips IntelliVue MX800 Patient Vital Signs Monitor",
            "Monitoring equipment",
            "Philips Healthcare",
            "MX800 Intensive Care",
            "SN-PH-33918",
            "Post-Anesthesia Recovery Unit",
            "AVAILABLE",
            LocalDateTime.now().minusDays(12),
            LocalDateTime.now().plusDays(15),
            "DUE_SOON",
            "{\"screenSize\": \"19-inch High-Res Active Touch\", \"ecgLeads\": 12, \"invasivePressures\": 4, \"co2Monitoring\": \"Microstream SpO2\"}"
        );
        equipmentRepository.save(eqMon);

        Equipment eqLab = new Equipment(
            "EQ-LAB-006",
            "Beckman Coulter Allegra X-30R Clinical Refrigerated Centrifuge",
            "Laboratory diagnostic devices",
            "Beckman Coulter",
            "Allegra X-30R Benchtop",
            "SN-BC-44109",
            "Central Pathology Lab",
            "AVAILABLE",
            LocalDateTime.now().minusDays(3),
            LocalDateTime.now().plusMonths(5),
            "VALID",
            "{\"maxRcf\": \"29441 x g\", \"tempRange\": \"-20°C to +40°C\", \"refrigerant\": \"CFC-free R404A\", \"rotorType\": \"SX4400 Swinging Bucket\"}"
        );
        equipmentRepository.save(eqLab);

        // 3. Instrument Trays & Instruments
        InstrumentTray tray1 = new InstrumentTray(
            "TRAY-ORTHO-01",
            "Major Orthopedic Joint Replacement Tray",
            "Orthopedics",
            "AWAITING_STERILIZATION",
            "HIGH",
            12,
            "AC-01",
            true,
            eqTray
        );
        trayRepository.save(tray1);

        // Instruments for TRAY-ORTHO-01
        Instrument inst1 = new Instrument("INST-SCIS-001", "Metzenbaum Dissecting Scissors Curved 18cm", "Scissors", "Martensitic Stainless Steel DIN 1.4021 / Tungsten Carbide", "BIO_BURDEN_LIGHT", "Awaiting Sterilization", "CYC-2026-1038", LocalDateTime.now().plusMonths(3));
        Instrument inst2 = new Instrument("INST-FORC-002", "Adson Micro-Tissue Forceps 1x2 Teeth 12cm", "Forceps", "Austenitic Surgical Stainless DIN 1.4301", "BIO_BURDEN_LIGHT", "Awaiting Sterilization", "CYC-2026-1038", LocalDateTime.now().plusMonths(4));
        Instrument inst3 = new Instrument("INST-NEED-003", "Crile-Wood Heavy Needle Holder 15cm", "Needle holders", "Tungsten Carbide Cross-Serrated Jaws", "CLEAN", "Awaiting Sterilization", "CYC-2026-1039", LocalDateTime.now().plusMonths(5));
        Instrument inst4 = new Instrument("INST-RETR-004", "Senn-Mueller Double-Ended Retractor 3-Prong", "Retractors", "Passivated Satin Matte Chrome Alloy", "BIO_BURDEN_LIGHT", "Awaiting Sterilization", "CYC-2026-1038", LocalDateTime.now().plusMonths(6));
        Instrument inst5 = new Instrument("INST-CLMP-005", "Rochester-Pean Hemostatic Forceps Curved 20cm", "Clamps", "Tempered Surgical Steel DIN 1.4028", "CLEAN", "Awaiting Sterilization", "CYC-2026-1037", LocalDateTime.now().plusMonths(3));
        Instrument inst6 = new Instrument("INST-BLAD-006", "Ergonomic Scalpel Handle No. 3 (Fits Blades 10-15)", "Surgical blades", "Solid Stainless Steel with Metric Ruler", "CLEAN", "Awaiting Sterilization", "CYC-2026-1039", LocalDateTime.now().plusMonths(12));

        tray1.addInstrument(inst1);
        tray1.addInstrument(inst2);
        tray1.addInstrument(inst3);
        tray1.addInstrument(inst4);
        tray1.addInstrument(inst5);
        tray1.addInstrument(inst6);
        trayRepository.save(tray1);

        // Tray 2: Cardiac
        InstrumentTray tray2 = new InstrumentTray(
            "TRAY-CARDIO-02",
            "Adult Cardiovascular Sternotomy & Bypass Set",
            "Cardiac Surgery",
            "STERILIZED",
            "NORMAL",
            45,
            "AC-01",
            false,
            null
        );
        trayRepository.save(tray2);

        // Tray 3: Laparoscopy
        InstrumentTray tray3 = new InstrumentTray(
            "TRAY-LAP-03",
            "Minimally Invasive Laparoscopic Trocar & Grasper Set",
            "General Surgery",
            "STERILIZED",
            "NORMAL",
            82,
            "AC-02",
            false,
            null
        );
        trayRepository.save(tray3);

        // 4. Initial Sterilization Request & Active Workflow Instance
        SterilizationRequest initialReq = new SterilizationRequest();
        initialReq.setRequestId("REQ-2026-0891");
        initialReq.setProcessInstanceId("PI-889104A");
        initialReq.setDepartment("Orthopedics");
        initialReq.setOperatingTheatre("OR-1 Orthopedic");
        initialReq.setEquipmentCategory("Surgical instrument trays");
        initialReq.setEquipmentId("EQ-TRAY-001");
        initialReq.setContaminationLevel("MEDIUM");
        initialReq.setCleaningStatus("PENDING");
        initialReq.setSterilizationMethod("STEAM_AUTOCLAVE_134C");
        initialReq.setAssignedTechnician("tech_sarah_connor");
        initialReq.setPriority("HIGH");
        initialReq.setNotes("Post-surgery total knee arthroplasty tray set. Inspect hinges and serrations for bone debris.");
        initialReq.setCurrentStage("INITIAL_INSPECTION");
        initialReq.setStatus("IN_PROGRESS");
        initialReq.setCleaningPassed(true);
        initialReq.setChemicalIndicatorPassed(true);
        initialReq.setFinalApprovalPassed(true);
        initialReq.setTrayCount(1);
        initialReq.setStartedAt(LocalDateTime.now().minusMinutes(18));
        requestRepository.save(initialReq);

        // 5. Active User Task in Custom Tasklist Inbox
        WorkflowTask initialTask = new WorkflowTask(
            "TASK-8192",
            "Initial Inspection",
            "PI-889104A",
            "REQ-2026-0891",
            "TRAY-ORTHO-01",
            null,
            "cssd-technician",
            "HIGH",
            "CREATED",
            LocalDateTime.now().plusHours(2),
            "camunda-forms:bpmn:initial-inspection-form",
            "{\"requestId\":\"REQ-2026-0891\",\"department\":\"Orthopedics\",\"equipmentId\":\"EQ-TRAY-001\",\"contaminationLevel\":\"MEDIUM\",\"traysCount\":1}"
        );
        taskRepository.save(initialTask);

        // 6. Historical Sterilization Cycles
        SterilizationCycle cycle = new SterilizationCycle();
        cycle.setCycleNumber("CYC-2026-1041");
        cycle.setAutoclaveId("AC-01");
        cycle.setAutoclaveModel("Siemens SteriGuard 660-X");
        cycle.setTargetTemperature(134.0);
        cycle.setTargetPressure(2.2);
        cycle.setCurrentTemperature(134.3);
        cycle.setCurrentPressure(2.22);
        cycle.setPhase("COMPLETED");
        cycle.setProgressPercent(100);
        cycle.setDurationSeconds(1080);
        cycle.setChemicalIndicatorResult("PASSED");
        cycle.setBiologicalIndicatorResult("NEGATIVE_CLEAR");
        cycle.setStatus("COMPLETED");
        cycle.setRequestId("REQ-2026-0889");
        cycle.setStartedAt(LocalDateTime.now().minusHours(2));
        cycle.setEndedAt(LocalDateTime.now().minusHours(1).minusMinutes(42));
        cycleRepository.save(cycle);

        // 7. Calibration Records
        CalibrationRecord cal1 = new CalibrationRecord(
            "CAL-2026-ISO-0941",
            "EQ-IMG-002",
            "Siemens Cios Alpha Mobile C-Arm Fluoroscopy System",
            "Marcus Vance, Lead Biomedical Engineer",
            "Fluke 754 NIST Documenting Process Calibrator",
            0.04,
            true,
            "CERTIFIED",
            "Detector linearity verified at 0.04% drift (limit ±0.5%). Laser crosshairs aligned to 0.2mm precision.",
            LocalDateTime.now().minusDays(15),
            LocalDateTime.now().plusMonths(6)
        );
        calibrationRepository.save(cal1);

        // 8. Maintenance Tickets
        MaintenanceRecord mnt1 = new MaintenanceRecord(
            "MNT-2026-0312",
            "EQ-MON-005",
            "Philips IntelliVue MX800 Patient Vital Signs Monitor",
            "PREVENTIVE",
            "Routine quarterly optical encoder cleaning and NIBP pneumatic cuff leak calibration.",
            "Elena Rostova, Biomed Tech",
            "MEDIUM",
            "OPEN",
            LocalDateTime.now().plusDays(4),
            null,
            180.0
        );
        maintenanceRepository.save(mnt1);

        log.info("STERILFLOW Database Seeded Successfully with Full Traceability.");
    }
}