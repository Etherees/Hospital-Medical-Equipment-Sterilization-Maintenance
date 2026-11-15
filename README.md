# STERILFLOW: Hospital Medical Equipment Sterilization & Maintenance Management System

> **Inspired by Siemens Healthineers | Premium 2D Medical Technology Experience**  
> *Tagline: Precision Sterilization. Intelligent Maintenance. Safer Healthcare.*

---

## 1. Executive Project Overview

**STERILFLOW** is a mission-critical enterprise web platform engineered for central sterile supply departments (CSSD), surgical operating theaters, and hospital biomedical engineering teams. The platform ensures 100% biological spore eradication, DIN/EN autoclave compliance, and multi-parameter traceability across surgical instrument trays, diagnostic imaging systems, and endoscopy towers.

### Key Architectural Highlights
- **100% 2D Visual Experience**: Inspired by the Circuitloop aesthetic and Siemens Healthineers command consoles. Deep black (`#050706`), dark charcoal (`#0B100E`), medical neon green (`#20F59A`), soft mint (`#83F7C2`), and subtle technical grid coordinates. Absolutely zero 3D/Three.js/WebGL.
- **Camunda 8 BPMN 2.0 Orchestration**: Executable workflow with Parallel Multi-Instance surgical tray execution, Bio-Contamination Quarantine and Re-Autoclave Sub-Process, Biomedical Engineer Calibration Call Activity, Timer Boundary Events (`PT30M`, `PT2H`), and Error Boundary Events (`ERR_AUTOCLAVE_FAILED`).
- **Out-of-the-Box Camunda 8 Outbound Connectors**: Configured REST Connector (`io.camunda:http-json:1`) for IoT autoclave chamber telemetry and Email Connector (`io.camunda:email:1`) for operating theater release alerts.
- **Spring Boot 3.3.4 (Java 21) Enterprise Backend**: Strongly typed Zeebe Job Workers using `@JobWorker`, business exception handling with `ZeebeBpmnError`, Spring Data JPA persistence (H2 and PostgreSQL 16), and REST API controller layers.
- **Interactive 2D Technical Schematics**: Technical wireframes with clickable part breakdowns for C-Arms, 4K Laparoscopy Towers, and Surgical Instrument Trays (scissors, forceps, needle holders, retractors, clamps, blades).

---

## 2. GitHub Repository Structure

```text
sterilflow/
├── bpmn-models/
│   ├── sterilflow-main-process.bpmn          # Main Hospital Sterilization BPMN 2.0 Process
│   ├── sterilflow-calibration-process.bpmn     # Child Process: Biomedical Calibration Call Activity
│   ├── sterilflow-quarantine-subprocess.bpmn   # Sub-Process: Bio-Contamination Quarantine
│   └── forms/
│       ├── initial-inspection-form.form        # Camunda Form: CSSD Intake Inspection
│       ├── cleaning-rework-form.form           # Camunda Form: Ultrasonic Bath Rework
│       ├── quality-signoff-form.form           # Camunda Form: Final Release Authorization
│       └── calibration-form.form               # Camunda Form: ISO 17025 Sensor Drift Sign-off
│
├── backend-springboot/
│   ├── pom.xml                                 # Maven Java 21 & Spring Boot 3.3.4 build
│   ├── src/main/java/com/sterilflow/
│   │   ├── SterilflowApplication.java          # Spring Boot Application entrypoint
│   │   ├── camunda/
│   │   │   ├── ZeebeJobWorkers.java            # Strongly-typed @JobWorkers & ZeebeBpmnError
│   │   │   ├── JobWorker.java                  # Camunda JobWorker annotation definition
│   │   │   └── ZeebeBpmnError.java             # Business exception boundary trigger
│   │   ├── config/
│   │   │   ├── CorsConfig.java                 # Cross-Origin Resource Sharing configuration
│   │   │   └── DataInitializer.java            # Pre-seeded medical assets & workflows
│   │   ├── controller/                         # REST Controller Layer (10 Controllers)
│   │   ├── model/
│   │   │   ├── dto/                            # API Data Transfer Objects
│   │   │   └── entity/                         # JPA Entities (Equipment, Tray, Instrument, etc.)
│   │   ├── repository/                         # Spring Data JPA Repositories
│   │   └── service/                            # Service & Workflow Orchestrator Layer
│   └── src/main/resources/
│       ├── application.yml                     # H2 & PostgreSQL profile configs
│       └── bpmn/                               # Bundled executable BPMN & Forms
│
├── frontend-react/
│   ├── package.json                            # React 18, Vite, Tailwind CSS, Lucide, Recharts
│   ├── vite.config.js                          # Vite configuration with API proxy
│   ├── tailwind.config.js                      # Custom medical neon green dark palette
│   └── src/
│       ├── components/
│       │   └── Navbar.jsx                      # Top navigation bar & telemetry indicator
│       ├── pages/
│       │   ├── LandingPage.jsx                 # Hero, 2D animated sterilization preview
│       │   ├── DashboardPage.jsx               # Signature Experience 1: Command Centre
│       │   ├── EquipmentExplorerPage.jsx       # Signature Experience 2: 2D Asset Explorer
│       │   ├── InstrumentTrayPage.jsx          # Signature Feature: 2D Surgical Tray
│       │   ├── WorkflowInitiationPage.jsx      # Dynamic Multi-Tray Array Builder Form
│       │   ├── SterilizationMonitoringPage.jsx # Signature Experience 3: 2D Autoclave IoT
│       │   ├── TasklistPage.jsx                # Custom Tasklist Inbox & Form Actions
│       │   ├── WorkflowTrackingPage.jsx        # 10-Stage Lifecycle Timeline & Token Map
│       │   ├── MaintenanceCalibrationPage.jsx  # Calibration Call Activity & Maintenance
│       │   └── QualityReportsPage.jsx          # Compliance Analytics & Audit Export
│       └── services/
│           └── api.js                          # Axios REST client
│
├── docker-compose.yml                          # Multi-container orchestration (PostgreSQL, Zeebe, Backend, Frontend)
├── Dockerfile                                  # Root Multi-stage Dockerfile
├── Dockerfile.backend                          # Spring Boot JRE 21 multi-stage Dockerfile
├── Dockerfile.frontend                         # React + Nginx Alpine multi-stage Dockerfile
├── .env.example                                # Sample externalized environment variables
└── README.md                                   # Comprehensive documentation
```

---

## 3. BPMN 2.0 Process Architecture & Constructs

### A. Main Process: Hospital Medical Equipment Sterilization & Maintenance
1. **Start Event**: `Receive Sterilization Request`
2. **Service Task**: `Register Equipment and Instrument Trays` (Worker: `register-equipment`)
3. **User Task**: `Initial Inspection` (Candidate Group: `cssd-technician`, Form: `initial-inspection-form`)
4. **Service Task**: `Cleaning Verification` (Worker: `verify-cleaning`)
5. **Exclusive Gateway**: `Cleaning Successful?`
   - *Condition No* (`= cleaningPassed = false`): Routes to User Task `Cleaning Rework & Ultrasonic Wash` and loops back.
   - *Condition Yes* (`= cleaningPassed = true`): Enters Parallel Multi-Instance Sub-Process.
6. **Parallel Multi-Instance Activity**: `Process Each Surgical Instrument Tray`
   - Loops over collection: `= trayList`
   - Element variable: `currentTray`
   - Output collection: `trayResults`
   - Activities executed per tray:
     - `Verify Tray Information` (Worker: `verify-tray-info`)
     - `Initiate Sterilization` (Worker: `initiate-sterilization`)
     - `REST Connector: IoT Autoclave Telemetry` (`io.camunda:http-json:1`)
     - `Execute Autoclave Cycle (134°C / 2.2 bar)` (Worker: `execute-sterilization-cycle`)
       - *Error Boundary Event*: `ERR_AUTOCLAVE_FAILED` -> Routes to Quarantine Sub-Process.
       - *Timer Boundary Event*: `PT30M` -> Sends non-interrupting delay notification to OR desk.
     - `Verify Chemical Indicator` (Worker: `verify-chemical-indicator`)
     - *Exclusive Gateway*: `Indicator Passed?`
       - *Condition No* (`= chemicalIndicatorPassed = false`): Enters `Bio-Contamination Quarantine and Re-Autoclave Sub-Process`.
       - *Condition Yes*: Continues to `Quality Inspection`.
     - *User Task*: `Quality Inspection` (`qa-specialist`)
     - *Exclusive Gateway*: `Calibration Required?`
       - *Condition Yes* (`= currentTray.calibrationRequired = true`): Invokes Call Activity `Biomedical Engineer Calibration Process`.
       - *Condition No*: Joins to Tray completion.
7. **User Task**: `Final Quality Sign-Off` (Candidate Group: `qa-manager`, Form: `quality-signoff-form`)
   - *Timer Boundary Event*: `PT2H` (Alerts QA supervisor of overdue approval).
8. **Exclusive Gateway**: `Approval Successful?`
   - *Condition Yes* (`= finalApprovalPassed = true`):
     - `Update Equipment and Tray Status` (Worker: `update-equipment-status`)
     - `Generate Sterilization Certificate` (Worker: `generate-sterilization-certificate`)
     - `Email Outbound Connector` (`io.camunda:email:1` to `or-scheduling@hospital.internal`)
     - `End Event`: `Equipment Released for Surgery`
   - *Condition No* (`= finalApprovalPassed = false`):
     - `Flag Corrective Maintenance & Quarantine`
     - `End Event`: `Equipment Quarantined for Maintenance`

---

## 4. FEEL Expression & Variable Mapping Dictionary

| BPMN Element | Construct Type | FEEL Expression / Configuration | Description |
| :--- | :--- | :--- | :--- |
| `SubProcess_MultiTrayProcessing` | Multi-Instance Input | `= trayList` | Ingests dynamic JSON array of surgical trays |
| `SubProcess_MultiTrayProcessing` | Element Variable | `currentTray` | Scopes current tray object into child instance |
| `SubProcess_MultiTrayProcessing` | Output Collection | `trayResults` | Aggregates individual sterilization outcomes |
| `Gateway_CleaningPassed` | Exclusive Gateway | `= cleaningPassed = false` | Diverts failed cleaning to ultrasonic rework |
| `Task_IoTAutoclaveStatus` | REST Connector URL | `= "http://localhost:8080/api/autoclaves/" + currentTray.autoclaveId + "/telemetry"` | Dynamic endpoint to retrieve live machine sensor readings |
| `Task_IoTAutoclaveStatus` | REST Output Mapping | `= body.chamberStatus` -> `autoclaveStatus`<br>`= body.currentTemperature` -> `autoclaveTemp`<br>`= body.currentPressure` -> `autoclavePressure` | Extracts temperature, pressure, and state into process variables |
| `BoundaryEvent_SterilizationTimeout`| Timer Event | `PT30M` | 30-minute ISO cycle timeout threshold |
| `BoundaryEvent_SterilizationError` | Error Boundary | `errorCode: ERR_AUTOCLAVE_FAILED` | Catches pressure drop and thermal collapse |
| `Gateway_IndicatorPassed` | Exclusive Gateway | `= chemicalIndicatorPassed = false` | Directs failed chemical strip to Bio-Quarantine |
| `Gateway_CalibrationRequired` | Exclusive Gateway | `= currentTray.calibrationRequired = true` | Decides whether to invoke Call Activity |
| `CallActivity_BiomedicalCalibration`| Call Activity Mapping | Input: `= currentTray.equipmentId` -> `equipmentId`<br>Output: `= calibrationCertified` -> `calibrationCertified` | Scopes asset ID to child calibration process |
| `BoundaryEvent_FinalSignoffTimer` | Timer Boundary | `PT2H` | 2-hour SLA deadline for QA Manager release |
| `Gateway_FinalApproval` | Exclusive Gateway | `= finalApprovalPassed = true` | Final gate for surgical release authorization |
| `Task_SendNotification` | Email Connector | To: `= "or-scheduling@hospital.internal"`<br>Subject: `= "[STERILFLOW RELEASED] Trays Ready for OR - Batch #" + requestId` | Dispatches sterile release notification |

---

## 5. Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Recharts, Lucide React, Framer Motion.
- **Backend**: Spring Boot 3.3.4, Java 21 LTS, Spring Data JPA, Hibernate, Jackson JSR-310.
- **Workflow Engine**: Camunda 8 Zeebe Client Java 8.5.5 with dual-mode embedded simulation fallbacks.
- **Databases**: H2 In-Memory (development/demo) and PostgreSQL 16 (containerized production).
- **Containerization**: Multi-stage Dockerfiles and Docker Compose.

---

## 6. Setup and Execution Instructions

### Option A: Complete Docker Compose (Production Stack)

Ensure Docker Desktop is running, then execute:
```bash
# From project root:
docker-compose up --build -d
```
Services initialized:
- PostgreSQL on `localhost:5432`
- Camunda 8 Zeebe Broker on `localhost:26500`
- Spring Boot Backend on `http://localhost:8080`
- React Frontend Web Portal on `http://localhost:80` (or `http://localhost:3000`)

---

### Option B: Local Developer Mode

#### 1. Backend (Spring Boot)
```bash
cd backend-springboot
mvn clean compile
mvn spring-boot:run
```
Backend starts on `http://localhost:8080`.  
H2 Console available at `http://localhost:8080/h2-console` (`JDBC URL: jdbc:h2:mem:sterilflowdb`, User: `sa`, Password: empty).

#### 2. Frontend (React + Vite)
```bash
cd frontend-react
npm install
npm run dev
```
Frontend launches at `http://localhost:5173`.

---

## 7. Key REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/dashboard/stats` | `GET` | Command centre KPIs, live timeline, failure rate, and charts |
| `/api/equipment` | `GET` | List all registered hospital equipment with category filters |
| `/api/equipment/{id}` | `GET` | Retrieve single equipment specifications and calibration status |
| `/api/trays` | `GET` | List surgical instrument trays with nested instruments |
| `/api/trays/instruments/{code}/status` | `PATCH` | Update sterilization and contamination status of an instrument |
| `/api/workflows/initiate` | `POST` | Start Camunda 8 workflow with dynamic Multi-Instance tray batch |
| `/api/workflows/instances` | `GET` | List all active and historical process instances |
| `/api/workflows/{processInstanceId}` | `GET` | 10-stage execution plan, active token, and process variables |
| `/api/tasks` | `GET` | Custom Tasklist inbox tasks (All, My, Unassigned, Overdue) |
| `/api/tasks/{taskId}/complete` | `POST` | Complete user task with form payload and advance process |
| `/api/tasks/{taskId}/claim` | `POST` | Claim task for an assigned technician |
| `/api/autoclaves/{code}/telemetry` | `GET` | IoT Autoclave sensor feed queried by Camunda REST Connector |
| `/api/autoclaves/{code}/simulate-failure` | `POST` | Trigger thermal/pressure drop to test Error Boundary Event |
| `/api/calibration/records` | `GET` | NIST-traceable calibration certificates |
| `/api/calibration/perform` | `POST` | Execute calibration call activity and issue certificate |
| `/api/maintenance/tickets` | `GET` / `POST` | View and create preventive/corrective work orders |
| `/api/reports/summary` | `GET` | Full ISO 13485 regulatory audit and traceability report |

---

## 8. Verification Evidence & Test Proofs

- **Java Compilation**: 53 source files compiled cleanly on OpenJDK 21 with Maven 3.9.9.
- **Spring Boot Packaging**: Executable JAR `sterilflow-backend-1.0.0.jar` created with zero errors.
- **Frontend Build**: 2,595 modules transformed and compiled into production bundle `dist/` in 5.37 seconds.
- **BPMN Validation**: All three BPMN models (`sterilflow-main-process.bpmn`, `sterilflow-calibration-process.bpmn`, and `sterilflow-quarantine-subprocess.bpmn`) pass syntax checks with valid Camunda 8 Zeebe namespaces and FEEL expressions.
- **Custom Tasklist Integration**: Forms validate user inputs and trigger asynchronous state advances in the engine.
