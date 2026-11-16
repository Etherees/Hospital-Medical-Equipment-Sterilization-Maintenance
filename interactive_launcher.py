import urllib.request
import urllib.error
import json
import time
import os
import webbrowser
import sys

CAMUNDA_BASE = "http://localhost:8080"

SCENARIOS = {
    "1": {
        "title": "Main Process - Full Happy Path (Sterilization -> Surgical Release)",
        "bpmn": "sterilflow-main-process",
        "description": "Full end-to-end sterilization cycle. Cleaning passes, chemical indicator passes, quality sign-off passes. Released for Surgery.",
        "variables": {
            "requestId": "REQ-HAPPY-01",
            "equipmentId": "EQ-TRAY-101",
            "equipmentCategory": "General Surgical",
            "department": "Surgery",
            "operatingTheatre": "OR-1 Main Suite",
            "urgency": "NORMAL",
            "assignedTechnician": "tech_marcus_vance",
            "cleaningPassed": True,
            "chemicalIndicatorPassed": True,
            "finalApprovalPassed": True,
            "surgicalTrays": [
                {
                    "trayId": "TRAY-GEN-01",
                    "trayName": "General Laparotomy Set",
                    "calibrationRequired": False
                }
            ]
        }
    },
    "2": {
        "title": "Main Process - Bio-Contamination Quarantine (Chemical Indicator Failed)",
        "bpmn": "sterilflow-main-process",
        "description": "Chemical indicator fails after autoclave. Routes through Bio-Contamination Quarantine call activity, enzymatic re-wash, 134C re-autoclave, and clearance.",
        "variables": {
            "requestId": "REQ-QUAR-01",
            "equipmentId": "EQ-TRAY-202",
            "equipmentCategory": "Orthopedic Implants",
            "department": "Orthopedics",
            "operatingTheatre": "OR-3 Ortho Suite",
            "urgency": "HIGH",
            "assignedTechnician": "tech_marcus_vance",
            "cleaningPassed": True,
            "chemicalIndicatorPassed": False,
            "finalApprovalPassed": True,
            "surgicalTrays": [
                {
                    "trayId": "TRAY-ORTHO-01",
                    "trayName": "Total Knee Arthroplasty Tray",
                    "calibrationRequired": False
                }
            ]
        }
    },
    "3": {
        "title": "Main Process - Sensor Calibration Required (Transducer Drift)",
        "bpmn": "sterilflow-main-process",
        "description": "Tray requires biomedical calibration. Routes through Invoke Biomedical Calibration Process, certifies sensor, updates expiry, and releases.",
        "variables": {
            "requestId": "REQ-CALIB-01",
            "equipmentId": "EQ-TRAY-303",
            "equipmentCategory": "Microsurgical Instruments",
            "department": "Neurosurgery",
            "operatingTheatre": "OR-5 Neuro Suite",
            "urgency": "HIGH",
            "assignedTechnician": "tech_marcus_vance",
            "cleaningPassed": True,
            "chemicalIndicatorPassed": True,
            "finalApprovalPassed": True,
            "surgicalTrays": [
                {
                    "trayId": "TRAY-NEURO-01",
                    "trayName": "Cranial Micro-Dissection Drill Set",
                    "calibrationRequired": True
                }
            ]
        }
    },
    "4": {
        "title": "Main Process - QA Rejection (Defect Found -> Maintenance Ticket)",
        "bpmn": "sterilflow-main-process",
        "description": "Final quality sign-off rejected. Routes to Flag Corrective Maintenance Ticket and Quarantined for Corrective Maintenance.",
        "variables": {
            "requestId": "REQ-REJECT-01",
            "equipmentId": "EQ-TRAY-404",
            "equipmentCategory": "Endoscopic Devices",
            "department": "Gastroenterology",
            "operatingTheatre": "OR-2 Endoscopy Suite",
            "urgency": "NORMAL",
            "assignedTechnician": "tech_marcus_vance",
            "cleaningPassed": True,
            "chemicalIndicatorPassed": True,
            "finalApprovalPassed": False,
            "surgicalTrays": [
                {
                    "trayId": "TRAY-ENDO-01",
                    "trayName": "Rigid Colonoscopy Diagnostic Set",
                    "calibrationRequired": False
                }
            ]
        }
    },
    "5": {
        "title": "Biomedical Calibration Subprocess - Success (Certified & Released)",
        "bpmn": "biomedical-engineer-calibration",
        "description": "Calibrates autoclave pressure and temperature transducers. Tolerance passed = true. Issues certificate, updates schedule, released.",
        "variables": {
            "equipmentId": "EQ-TRAY-505",
            "trayId": "TRAY-CAL-01",
            "tolerancePassed": True,
            "technicianId": "tech_sarah_chen",
            "calibrationType": "PRESSURE_AND_TEMPERATURE",
            "measuredTemperature": 134.2,
            "measuredPressure": 2.15
        }
    },
    "6": {
        "title": "Biomedical Calibration Subprocess - Failure (Decommissioned)",
        "bpmn": "biomedical-engineer-calibration",
        "description": "Transducer sensor drift exceeds margin. Tolerance passed = false. Quarantines defective subsystem, flags corrective maintenance, decommissioned.",
        "variables": {
            "equipmentId": "EQ-TRAY-606",
            "trayId": "TRAY-CAL-02",
            "tolerancePassed": False,
            "technicianId": "tech_sarah_chen",
            "calibrationType": "PRESSURE_AND_TEMPERATURE",
            "measuredTemperature": 128.4,
            "measuredPressure": 1.72,
            "decommissionReason": "Transducer sensor drift exceeds 5% acceptable margin"
        }
    },
    "7": {
        "title": "Bio-Contamination Quarantine Subprocess - Direct Run",
        "bpmn": "bio-contamination-quarantine",
        "description": "Direct execution of the bio-contamination protocol: isolation -> audit trail -> enzymatic wash -> 134C re-autoclave -> clearance sign-off.",
        "variables": {
            "equipmentId": "EQ-TRAY-707",
            "trayId": "TRAY-BIO-01",
            "incidentSeverity": "HIGH",
            "technicianId": "tech_elena_rostova",
            "reautoclaveCycleType": "EXTENDED_134C_18MIN"
        }
    }
}

def post_json(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_instance_status(inst_key):
    try:
        url = f"{CAMUNDA_BASE}/v2/process-instances/{inst_key}"
        with urllib.request.urlopen(url, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("state", "UNKNOWN")
    except Exception:
        return "UNKNOWN"

def run_scenario(key):
    scen = SCENARIOS[key]
    print("\n" + "=" * 70)
    print(f"[*] LAUNCHING: {scen['title']}")
    print(f"[*] Process ID: {scen['bpmn']}")
    print(f"[*] Payload:")
    print(json.dumps(scen['variables'], indent=2))
    print("=" * 70)

    payload = {
        "processDefinitionId": scen["bpmn"],
        "variables": scen["variables"]
    }

    try:
        res = post_json(f"{CAMUNDA_BASE}/v2/process-instances", payload)
        inst_key = res.get("processInstanceKey")
        print(f"\n[OK] Process Instance Created Successfully!")
        print(f"[>] Instance Key: {inst_key}")
        operate_url = f"http://localhost:8080/operate/processes/{inst_key}"
        print(f"[>] Live Operate URL: {operate_url}")
        print("\n[*] Waiting for workers to advance tokens to completion...")

        # Monitor completion
        for _ in range(30):
            time.sleep(1)
            state = get_instance_status(inst_key)
            if state == "COMPLETED":
                print(f"\n[SUCCESS] Process Instance {inst_key} reached End Event: COMPLETED!")
                print(f"[*] All tokens resolved successfully.")
                break
            elif state in ("ACTIVE", "UNKNOWN"):
                sys.stdout.write(".")
                sys.stdout.flush()

        print(f"\n[*] Opening instance in Camunda Operate...")
        webbrowser.open(operate_url)
        print("[OK] Opened in browser! You can see the green checkmarks and path now.\n")

    except Exception as e:
        print(f"\n[ERROR] Failed to start instance: {e}")
        print("[!] Ensure Camunda 8 is running on http://localhost:8080.")

def main_menu():
    while True:
        print("\n" + "=" * 75)
        print("          STERILFLOW 2.0 - CAMUNDA 8 WORKFLOW DEMO LAUNCHER")
        print("=" * 75)
        print(" Choose a workflow scenario to run:")
        print("   [1] Main Process - Full Happy Path (Sterilization -> Surgical Release)")
        print("   [2] Main Process - Bio-Contamination Quarantine (Indicator Failed)")
        print("   [3] Main Process - Sensor Calibration Required (Transducer Drift)")
        print("   [4] Main Process - QA Rejection (Defect -> Maintenance Ticket)")
        print("   ---------------------------------------------------------------------")
        print("   [5] Biomedical Calibration Subprocess - Success (Certified & Released)")
        print("   [6] Biomedical Calibration Subprocess - Failure (Decommissioned)")
        print("   ---------------------------------------------------------------------")
        print("   [7] Bio-Contamination Quarantine Subprocess - Direct Run")
        print("   ---------------------------------------------------------------------")
        print("   [8] Open Camunda Operate Dashboard (http://localhost:8080/operate)")
        print("   [9] Open STERILFLOW React Web Application (http://localhost:5173)")
        print("   [0] Exit")
        print("=" * 75)

        choice = input("Enter option [0-9]: ").strip()
        if choice == "0":
            print("\nExiting. Thank you!")
            break
        elif choice in SCENARIOS:
            run_scenario(choice)
            input("\nPress Enter to return to menu...")
        elif choice == "8":
            webbrowser.open("http://localhost:8080/operate")
        elif choice == "9":
            webbrowser.open("http://localhost:5173")
        else:
            print("[!] Invalid option. Please enter 0 to 9.")

if __name__ == "__main__":
    main_menu()
