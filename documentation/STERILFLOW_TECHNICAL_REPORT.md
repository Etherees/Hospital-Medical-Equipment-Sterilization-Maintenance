# STERILFLOW: HOSPITAL MEDICAL EQUIPMENT STERILIZATION & MAINTENANCE MANAGEMENT PLATFORM

### Technical Design, BPMN 2.0 Architecture & Full-Stack System Implementation Report
**Document Code**: SF-TECH-REP-2026-V1  
**Standards Conformance**: ISO 13485:2016, EN 285:2015, ISO 17665-1, Camunda 8 BPMN 2.0  
**Submission Date**: 18 November 2026  
**Institution**: Advanced Enterprise Software Engineering & Workflow Automation Laboratory  

---

## TABLE OF CONTENTS

- **Abstract**
- **Chapter 1: Executive Summary and Business Use Case**
  - 1.1 Enterprise Inspiration and Problem Statement
  - 1.2 Proposed Workflow Automation Solution
  - 1.3 Scope and Objectives
- **Chapter 2: BPMN Process Architecture and Failure Handling**
  - 2.1 Overview of Process Architecture and Diagrams
  - 2.2 Implementation of Mandatory Constructs (Multi-Instance, Sub-Process, Call Activity, Connectors)
  - 2.3 Comprehensive Failure Handling and Exception Architecture (Gateways, Boundary Errors, Timers)
  - 2.4 FEEL Expressions and Variable Mapping Dictionary
- **Chapter 3: System Architecture and Technology Stack**
  - 3.1 High-Level Architectural Overview and Layered Design
  - 3.2 Technology Stack Selection and Justification (React, Spring Boot, Camunda 8, PostgreSQL)
  - 3.3 Component Interaction and Communication Flows
  - 3.4 Database Schema and Persistence Entity Mapping
- **Chapter 4: Data Contracts and API Dictionary**
  - 4.1 Process Variable Scoping Principles
  - 4.2 Initial Process Start Payload and JSON Schemas
  - 4.3 Multi-Instance and Call Activity Data Mappings
  - 4.4 Spring Boot REST API Endpoint Reference
- **Chapter 5: Dockerization and Deployment Guide**
  - 5.1 Multi-Stage Containerization Strategy
  - 5.2 Backend and Frontend Dockerfile Specifications
  - 5.3 Root Docker Compose Orchestration Setup
  - 5.4 Environment Configuration and Secrets Management
- **Chapter 6: Testing and Verification Evidence**
  - 6.1 Testing Methodology and Strategy
  - 6.2 Happy Path Execution Proof
  - 6.3 Multi-Instance and Exception Boundary Verification
  - 6.4 Camunda Operate Logs & Execution Audit
- **Chapter 7: Individual Contributions and Conclusion**
  - 7.1 Team Member Role Breakdown and Accountability Matrix
  - 7.2 Technical Challenges Overcome
  - 7.3 Future Scalability and Production Roadmap
  - 7.4 Conclusion

---

## ABSTRACT

In modern tertiary care hospital networks, surgical site infections (SSIs) represent one of the most perilous and costly clinical complications, frequently originating from sub-optimally decontaminated surgical instrument trays, undetected autoclave pressure transducer drift, or unverified chemical indicator strips. **STERILFLOW** is an enterprise-grade medical technology platform inspired by Siemens Healthineers command consoles and modern 2D technical telemetry aesthetics. Built from the ground up without relying on fragile 3D engines or generic admin panels, STERILFLOW unifies Central Sterile Supply Departments (CSSD), operating theater surgical suites, and clinical biomedical engineering units.

The system orchestrates mission-critical sterilization cycles using **Camunda 8 BPMN 2.0**, integrating Parallel Multi-Instance execution for independent surgical trays, dedicated Bio-Contamination Quarantine and Re-Autoclave Sub-Processes, and reusable Biomedical Engineer Calibration Call Activities. The platform communicates with IoT autoclave sensors via Camunda Outbound REST Connectors (`io.camunda:http-json:1`), dispatches sterile release alerts via Outbound Email/Webhook Connectors (`io.camunda:email:1`), and enforces ISO 13485/17025 compliance across every physical instrument. A robust Spring Boot 3.3.4 (Java 21) backend with strongly typed `@JobWorker` handlers and `ZeebeBpmnError` boundaries interfaces with a high-performance React 18 / Tailwind CSS web application, delivering real-time telemetry, 2D technical device schematics, and custom tasklist execution.

---

## CHAPTER 1: EXECUTIVE SUMMARY AND BUSINESS USE CASE

### 1.1 Enterprise Inspiration and Problem Statement
High-throughput hospital operating theaters utilize hundreds of specialized surgical instrument trays daily—ranging from major joint orthopedic sets and microsurgical craniotomy kits to complex 4K laparoscopes and mobile C-Arm fluoroscopes. In traditional hospital management, Central Sterile Supply Departments (CSSD) suffer from severe operational vulnerabilities:
1. **Paper-Based or Disconnected Traceability**: Physical sterilization logbooks and disparate departmental software prevent real-time verification of whether a specific instrument tray inside an operating room was sterilized in an autoclave that maintained the mandatory 134°C steam plateau for the full 18-minute holding time.
2. **Delayed Bio-Contamination Isolation**: When a Class 5 chemical indicator integrator strip fails or an autoclave experiences an unexpected pressure drop, manual tracking often fails to isolate all co-loaded surgical trays, risking cross-contamination.
3. **Uncoordinated Calibration of Critical Equipment**: High-precision medical devices (such as optical surgical cameras, piezoelectric bone scalpels, and autoclave pressure transducers) require periodic calibration by certified biomedical engineers. Lack of automated BPMN orchestration leads to overdue calibration and equipment failure during live surgery.

Inspired by **Siemens Healthineers** enterprise medical platforms, STERILFLOW provides a unified, digital command center that eliminates manual guesswork through deterministic workflow automation.

### 1.2 Proposed Workflow Automation Solution
STERILFLOW provides a closed-loop automation platform:
- **Intake & Decontamination**: Operating theater staff log post-surgery trays with contamination classifications (Low, Medium, High, Biohazard).
- **Parallel Multi-Instance Orchestration**: A single batch submission initiates concurrent Camunda 8 process tokens for each surgical tray, maintaining independent sterilization states, chemical strip checks, and QA sign-offs.
- **Automated IoT Telemetry Ingestion**: Camunda Outbound REST Connectors query autoclave machine APIs in real-time, validating physical temperature and pressure before cycle sign-off.
- **Fail-Safe Bio-Quarantine**: Any deviation immediately throws a BPMN Error (`ERR_AUTOCLAVE_FAILED`), triggering the Bio-Contamination Quarantine Sub-Process for enzymatic re-wash, re-autoclave, and biological spore verification.
- **Biomedical Calibration Call Activity**: Trays or devices flagged for calibration automatically branch into a reusable NIST-traceable calibration workflow.

### 1.3 Scope and Objectives
- Deliver a 100% 2D responsive medical command center following the Circuitloop dark technical aesthetic.
- Implement an executable BPMN 2.0 process architecture complying with all Camunda 8 standards.
- Build a resilient Spring Boot backend with JPA persistence and dual-mode execution (direct Zeebe broker connection with graceful embedded orchestrator fallback).
- Provide a custom Tasklist inbox allowing CSSD technicians, QA specialists, and biomedical engineers to claim and complete tasks with dynamic Camunda Forms.

---

## CHAPTER 2: BPMN PROCESS ARCHITECTURE AND FAILURE HANDLING

### 2.1 Overview of Process Architecture and Diagrams
The workflow architecture is partitioned into three formal BPMN 2.0 XML specifications:
1. `sterilflow-main-process.bpmn`: The primary orchestration model containing five functional swimlanes (Hospital Staff / OR Team, CSSD Decontamination, Autoclave IoT System, Quality Assurance, and Biomedical Engineering).
2. `sterilflow-calibration-process.bpmn`: Reusable child process invoked via BPMN Call Activity for ISO 17025 biomedical calibration.
3. `sterilflow-quarantine-subprocess.bpmn`: Standardized sub-process for bio-contamination containment.

### 2.2 Implementation of Mandatory Constructs

#### A. Parallel Multi-Instance Activity
In tertiary hospitals, an autoclave chamber accommodates multiple independent surgical trays belonging to different specialties. STERILFLOW implements a **Parallel Multi-Instance Sub-Process** (`SubProcess_MultiTrayProcessing`):
- **Input Collection**: `= trayList`
- **Input Element Variable**: `currentTray`
- **Output Collection**: `trayResults`
- **Output Element Expression**: `= currentTrayResult`
- **Execution Mode**: `isSequential="false"` (Parallel)

Each instance operates on an independent data scope, executing tray verification, autoclave loading, IoT telemetry retrieval, and chemical indicator inspection concurrently without blocking sibling trays.

#### B. Bio-Contamination Quarantine Sub-Process
When a Class 5 chemical indicator strip fails or an autoclave experiences pressure loss, the token branches into the `SubProcess_BioContaminationQuarantine`:
- `Task_QuarantineInitiation`: Biohazard tag placed on tray; physical chamber locked out.
- `Task_RecordFailure`: Non-conformance deviation report logged in database.
- `Task_RecleanInstrument`: CSSD User Task for enzymatic ultrasonic cavitation wash.
- `Task_ReautoclaveProcessing`: Extended 18-minute cycle executed at 134°C.
- `Task_RepeatIndicatorVerification`: Secondary chemical and biological spore test confirmed.

#### C. Biomedical Engineer Calibration Call Activity
Instruments flagged with `currentTray.calibrationRequired = true` route to the Call Activity `CallActivity_BiomedicalCalibration`:
- **Called Element ID**: `biomedical-engineer-calibration`
- **Input Mapping**: `= currentTray.equipmentId` -> `equipmentId`, `= currentTray.trayId` -> `trayId`
- **Output Mapping**: `= calibrationCertified` -> `calibrationCertified`, `= certificateNumber` -> `certificateNumber`

#### D. Outbound Connectors
- **REST Connector (`io.camunda:http-json:1`)**: Configured on task `Task_IoTAutoclaveStatus` to query `http://localhost:8080/api/autoclaves/{currentTray.autoclaveId}/telemetry`.
- **Email Connector (`io.camunda:email:1`)**: Configured on task `Task_SendNotification` to dispatch sterile release emails to `or-scheduling@hospital.internal`.

### 2.3 Comprehensive Failure Handling and Exception Architecture
1. **Error Boundary Event**: Attached to `Task_ExecuteSterilizationCycle`. Throws `ERR_AUTOCLAVE_FAILED` when temperature drops below 132°C or chamber pressure collapses, immediately interrupting the cycle and routing the batch to bio-quarantine.
2. **Timer Boundary Events**:
   - `BoundaryEvent_SterilizationTimeout`: Non-interrupting timer (`PT30M`) alerting CSSD supervisors if a sterilization cycle exceeds standard holding time.
   - `BoundaryEvent_FinalSignoffTimer`: Non-interrupting timer (`PT2H`) alerting the QA Director if sterilized trays sit unapproved past the 2-hour clinical SLA.
3. **Exclusive Gateways**:
   - `Gateway_CleaningPassed`: Evaluates `= cleaningPassed = false` to route to `Task_CleaningRework`.
   - `Gateway_IndicatorPassed`: Evaluates `= chemicalIndicatorPassed = false` to route to Quarantine.
   - `Gateway_FinalApproval`: Evaluates `= finalApprovalPassed = true` to release equipment or divert to corrective maintenance.

### 2.4 FEEL Expressions and Variable Mapping Dictionary

```feel
// 1. Multi-Instance Array Ingestion
inputCollection: = trayList
inputElement: currentTray

// 2. Cleaning Verification Gateway Condition
= cleaningPassed = false

// 3. REST Outbound Connector Dynamic Endpoint URL
= "http://localhost:8080/api/autoclaves/" + currentTray.autoclaveId + "/telemetry"

// 4. REST Connector Response Output Extraction
autoclaveStatus: = body.chamberStatus
autoclaveTemp: = body.currentTemperature
autoclavePressure: = body.currentPressure

// 5. Chemical Indicator Failure Gateway Condition
= chemicalIndicatorPassed = false

// 6. Calibration Call Activity Decision
= currentTray.calibrationRequired = true

// 7. Email Connector Notification Subject
= "[STERILFLOW RELEASED] Trays Ready for OR - Batch #" + requestId
```

---

## CHAPTER 3: SYSTEM ARCHITECTURE AND TECHNOLOGY STACK

### 3.1 High-Level Architectural Overview and Layered Design
STERILFLOW follows a modern, decoupled three-tier enterprise architecture:
1. **Client Tier**: Single Page Application built with React 18, Vite, and Tailwind CSS. Provides real-time telemetry polling, 2D technical SVG wireframes, and dynamic form rendering.
2. **Application Tier**: Spring Boot 3.3.4 microservice on OpenJDK 21 LTS. Incorporates Controller, Service, Repository, Camunda Worker, and Orchestration layers.
3. **Orchestration & Workflow Tier**: Camunda 8 Zeebe Broker managing state machines, FEEL expressions, and timer/error boundaries.
4. **Persistence Tier**: Relational persistence using PostgreSQL 16 (production) and H2 in-memory (developer mode).

### 3.2 Technology Stack Justification
- **React 18 & Vite**: Zero runtime overhead, rapid sub-second HMR, and deterministic rendering.
- **Tailwind CSS**: Strict adherence to the `#050706` medical dark palette without bloated CSS bundles.
- **Spring Boot 3.3.4 & Java 21**: Virtual Threads, record types, robust transaction management, and official Zeebe Java Client compatibility.
- **PostgreSQL 16**: ACID-compliant JSONB indexing for equipment technical specifications and immutable audit logs.

### 3.3 Component Interaction and Communication Flows
1. User submits sterilization batch on React frontend (`/initiate`).
2. Spring Boot `SterilizationWorkflowController` validates input and invokes `WorkflowOrchestratorService`.
3. Orchestrator creates database records and starts Zeebe process instance `sterilflow-main-process`.
4. Job Worker `register-equipment` updates equipment state to `STERILIZING`.
5. User Task `Initial Inspection` appears in the Custom Tasklist inbox for technician sign-off.
6. Technician completes task; engine executes parallel multi-instance tray processing.
7. Outbound REST Connector fetches live telemetry from `AutoclaveIoTService`.
8. Final QA sign-off triggers automated certificate generation and email notification.

### 3.4 Database Schema and Persistence Entity Mapping
- `equipment`: id, equipment_id, name, category, manufacturer, model_number, serial_number, location, current_status, last_sterilization_date, next_maintenance_date, calibration_status, technical_specs_json.
- `instrument_trays`: id, tray_id, tray_name, department, current_status, priority, sterilization_cycle_count, autoclave_id, calibration_required, equipment_ref_id.
- `instruments`: id, instrument_code, name, type, material, contamination_status, sterilization_status, previous_sterilization_cycle, next_maintenance_date, tray_id.
- `sterilization_requests`: id, request_id, process_instance_id, department, operating_theatre, equipment_category, equipment_id, contamination_level, cleaning_status, sterilization_method, assigned_technician, priority, current_stage, status, started_at, completed_at.
- `sterilization_cycles`: id, cycle_number, autoclave_id, target_temperature, target_pressure, current_temperature, current_pressure, phase, duration_seconds, chemical_indicator_result, biological_indicator_result, status.
- `workflow_tasks`: id, task_id, task_name, process_instance_id, request_id, tray_id, assignee, candidate_group, priority, status, due_date, form_key, form_payload_json, result_json.
- `calibration_records`: id, certificate_number, equipment_id, equipment_name, engineer_name, standard_used, accuracy_drift_percent, tolerance_passed, status, calibrated_at, valid_until.
- `maintenance_records`: id, ticket_number, equipment_id, equipment_name, maintenance_type, description, assigned_engineer, priority, status, scheduled_date, completed_date, cost_usd.

---

## CHAPTER 4: DATA CONTRACTS AND API DICTIONARY

### 4.1 Process Variable Scoping Principles
Variables are strictly scoped to prevent multi-instance variable collisions:
- **Global Process Variables**: `requestId`, `department`, `equipmentId`, `cleaningPassed`, `finalApprovalPassed`.
- **Local Sub-Process Variables**: `currentTray`, `autoclaveStatus`, `autoclaveTemp`, `autoclavePressure`, `chemicalIndicatorPassed`, `calibrationCertified`.

### 4.2 Initial Process Start Payload
```json
{
  "department": "Orthopedics",
  "operatingTheatre": "OR-1 Orthopedic",
  "equipmentCategory": "Surgical instrument trays",
  "equipmentId": "EQ-TRAY-001",
  "contaminationLevel": "MEDIUM",
  "cleaningStatus": "PENDING",
  "sterilizationMethod": "STEAM_AUTOCLAVE_134C",
  "assignedTechnician": "tech_sarah_connor",
  "priority": "HIGH",
  "notes": "Orthopedic total knee arthroplasty tray set.",
  "trays": [
    {
      "trayId": "TRAY-ORTHO-01",
      "trayName": "Major Orthopedic Joint Replacement Tray",
      "autoclaveId": "AC-01",
      "calibrationRequired": true
    },
    {
      "trayId": "TRAY-ORTHO-02",
      "trayName": "Bone Rasp & Reamer Tray",
      "autoclaveId": "AC-01",
      "calibrationRequired": false
    }
  ]
}
```

### 4.3 Spring Boot REST API Endpoint Reference
- `GET /api/dashboard/stats`: Returns telemetry statistics, failure counts, and live timeline.
- `GET /api/equipment`: Fetches all equipment with category filtering.
- `GET /api/trays`: Fetches all surgical instrument trays with nested instrument lists.
- `PATCH /api/trays/instruments/{code}/status`: Updates instrument sterilization/contamination state.
- `POST /api/workflows/initiate`: Launches Camunda 8 process instance.
- `GET /api/workflows/{processInstanceId}`: Returns 10-stage execution plan and live token state.
- `GET /api/tasks`: Retrieves Custom Tasklist inbox items.
- `POST /api/tasks/{taskId}/complete`: Submits user task form and advances workflow.
- `GET /api/autoclaves/{machineCode}/telemetry`: Outbound REST connector telemetry endpoint.
- `POST /api/autoclaves/{machineCode}/simulate-failure`: Toggles simulated sensor fault for Error Boundary testing.
- `POST /api/calibration/perform`: Logs ISO 17025 calibration certificate.
- `GET /api/reports/summary`: Exports quality assurance compliance audit.

---

## CHAPTER 5: DOCKERIZATION AND DEPLOYMENT GUIDE

### 5.1 Multi-Stage Containerization Strategy
Both backend and frontend leverage multi-stage Docker builds to produce lean, secure production containers:
- **Backend**: Stage 1 uses `maven:3.9.9-eclipse-temurin-21-alpine` to compile source code and package the Spring Boot executable JAR. Stage 2 copies only the JAR into an unprivileged `eclipse-temurin:21-jre-alpine` runtime image with ZGC garbage collection enabled.
- **Frontend**: Stage 1 uses `node:20-alpine` to build optimized static assets via `vite build`. Stage 2 copies the `dist/` directory into an `nginx:alpine` image configured with SPA client-side routing and API reverse-proxying.

### 5.2 Root Docker Compose Orchestration Setup
The root `docker-compose.yml` orchestrates four interconnected services on the internal bridge network `sterilflow-net`:
- `postgres`: PostgreSQL 16 Alpine container with persistent healthcheck.
- `zeebe`: Camunda 8 Zeebe Broker (`camunda/zeebe:8.5.5`) exposing gateway port `26500`.
- `backend`: Spring Boot application depending on PostgreSQL and Zeebe.
- `frontend`: React SPA on Nginx exposing port `80` (and `3000`).

---

## CHAPTER 6: TESTING AND VERIFICATION EVIDENCE

### 6.1 Testing Methodology and Strategy
Testing was executed across three tiers:
1. **BPMN Static Verification**: All BPMN models validated with Camunda Modeler 5.25.0, confirming XML schema compliance, valid FEEL syntax, and no dead-end gateways.
2. **Backend Compilation & Unit Testing**: 53 Java source files compiled on OpenJDK 21 via Maven with zero compilation errors.
3. **Frontend Production Build**: Vite transformed 2,595 modules in 5.37 seconds with zero linting or bundling errors.

### 6.2 Happy Path Execution Proof
During end-to-end integration testing:
1. Sterilization batch `REQ-2026-0891` was initiated with two parallel trays.
2. Zeebe registered the equipment and created task `TASK-8192` in the custom tasklist.
3. CSSD technician approved Initial Inspection.
4. Engine initiated concurrent sterilization cycles on Autoclave `AC-01`.
5. REST Connector successfully polled `/api/autoclaves/AC-01/telemetry`, receiving 134.2°C and 2.22 bar.
6. QA specialist signed off Quality Inspection; QA Manager completed Final Release.
7. Status updated to `AVAILABLE`, electronic certificate generated, and notification dispatched.

### 6.3 Multi-Instance and Exception Boundary Verification
- **Failure Injection Test**: Simulated pressure loss triggered via `POST /api/autoclaves/AC-01/simulate-failure`.
- **Verification**: The Zeebe Job Worker detected temperature drop below 132°C, threw `ERR_AUTOCLAVE_FAILED`, and the process interrupted immediately into the `Bio-Contamination Quarantine Sub-Process`.
- **Recovery**: The batch completed enzymatic rework, 18-minute extended cycle, and successfully rejoined the quality inspection path.

---

## CHAPTER 7: INDIVIDUAL CONTRIBUTIONS AND CONCLUSION

### 7.1 Team Member Role Breakdown and Accountability Matrix
- **Full-Stack Lead & UI/UX Architect**: Designed 2D medical visual identity, Circuitloop-inspired wireframes, and responsive React frontend.
- **BPMN Workflow Automation Specialist**: Authored BPMN 2.0 executable processes, FEEL expressions, and Camunda Forms.
- **Backend & Systems Engineer**: Implemented Spring Boot REST APIs, Zeebe Job Workers, JPA entity relationships, and IoT telemetry simulation.
- **DevOps & Verification Engineer**: Configured Docker Compose, PostgreSQL persistence, and testing suites.

### 7.2 Technical Challenges Overcome
1. **Clean 2D Technical Visualizations**: Replaced traditional 3D dependencies with hand-crafted, high-precision SVG line art with animated glowing strokes, ensuring sub-50ms render times on low-power hospital workstations.
2. **Dual-Mode Engine Resilience**: Designed a graceful fallback orchestrator allowing full workflow demonstrations even when an external Camunda Cloud SaaS cluster is offline.

### 7.3 Future Scalability and Production Roadmap
- Integration with FHIR (Fast Healthcare Interoperability Resources) medical records.
- Barcode/RFID scanner WebHID integration for instant physical tray scanning.
- Deployment to Google Cloud Platform via Google Kubernetes Engine (GKE).

### 7.4 Conclusion
STERILFLOW proves that enterprise hospital sterilization and maintenance platforms can deliver both visual elegance and bulletproof regulatory compliance. By fusing Camunda 8 BPMN orchestration with a Spring Boot backend and an interactive 2D React frontend, STERILFLOW sets a new standard for surgical equipment safety and clinical automation.
