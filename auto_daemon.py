import urllib.request
import urllib.error
import json
import time
import sys

CAMUNDA_BASE = "http://localhost:8080"

JOB_TYPES = [
    "register-equipment",
    "verify-cleaning",
    "io.camunda.zeebe:userTask",
    "execute-sterilization-cycle",
    "verify-chemical-indicator",
    "update-equipment-status",
    "generate-sterilization-certificate",
    "send-notification",
    "io.camunda:email:1",
    "io.camunda:http-json:1",
    "log-calibration-ticket",
    "execute-sensor-calibration",
    "issue-calibration-cert",
    "update-calibration-expiry",
    "quarantine-initiation",
    "record-failure",
    "reautoclave-processing",
    "repeat-indicator-verification",
    "quarantine-defective-subsystem",
    "flag-corrective-maintenance",
    "alert-technician",
    "send-overdue-alert"
]

def post_json(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            content = resp.read().decode("utf-8")
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        return None
    except Exception as e:
        return None

def check_camunda_connection():
    print("[*] Connecting to Camunda 8 at http://localhost:8080 ...", flush=True)
    retries = 0
    while True:
        try:
            req = urllib.request.Request(f"{CAMUNDA_BASE}/v2/topology", method="GET")
            with urllib.request.urlopen(req, timeout=3) as resp:
                if resp.status == 200:
                    print("[OK] Connected to Camunda 8 Zeebe Cluster successfully!", flush=True)
                    return True
        except Exception:
            retries += 1
            if retries % 5 == 1:
                print("[*] Waiting for Camunda 8 cluster to be ready on port 8080...", flush=True)
            time.sleep(2)

def run_daemon():
    check_camunda_connection()
    print("[DAEMON] Sterilflow Universal Workflow Daemon Active & Listening...", flush=True)
    print("[DAEMON] Any workflow started from Camunda Desktop Modeler, Operate, or Launcher will auto-advance to end.", flush=True)
    step_count = 0
    last_heartbeat = time.time()

    while True:
        work_done = False
        for jtype in JOB_TYPES:
            act_payload = {
                "type": jtype,
                "timeout": 10000,
                "maxJobsToActivate": 20,
                "requestTimeout": 100,
                "worker": "sterilflow-universal-daemon"
            }
            res = post_json(f"{CAMUNDA_BASE}/v2/jobs/activation", act_payload)
            if res and "jobs" in res and res["jobs"]:
                work_done = True
                for job in res["jobs"]:
                    jkey = job["jobKey"]
                    elem = job.get("elementId", "")
                    inst = job.get("processInstanceKey", "")
                    raw_vars = job.get("variables", {})

                    # 1. Unpack wrapped variables if present
                    unpacked = {}
                    if "variables" in raw_vars:
                        inner = raw_vars["variables"]
                        if isinstance(inner, str):
                            try:
                                inner = json.loads(inner)
                            except Exception:
                                inner = {}
                        if isinstance(inner, dict):
                            unpacked.update(inner)

                    # 2. Extract user choices with smart defaults
                    cleaning_passed = unpacked.get("cleaningPassed", raw_vars.get("cleaningPassed", True))
                    chemical_passed = unpacked.get("chemicalIndicatorPassed", raw_vars.get("chemicalIndicatorPassed", True))
                    final_passed = unpacked.get("finalApprovalPassed", raw_vars.get("finalApprovalPassed", True))
                    tolerance_passed = unpacked.get("tolerancePassed", raw_vars.get("tolerancePassed", True))
                    
                    # Tray-level calibration check
                    current_tray = raw_vars.get("currentTray", {})
                    calib_required = False
                    if isinstance(current_tray, dict):
                        calib_required = current_tray.get("calibrationRequired", False)
                    if "surgicalTrays" in unpacked and isinstance(unpacked["surgicalTrays"], list) and len(unpacked["surgicalTrays"]) > 0:
                        first_tray = unpacked["surgicalTrays"][0]
                        if isinstance(first_tray, dict) and "calibrationRequired" in first_tray:
                            calib_required = first_tray["calibrationRequired"]

                    # 3. Construct completion payload preserving user intent
                    vars_to_send = {
                        "equipmentRegistered": True,
                        "cleaningPassed": cleaning_passed,
                        "chemicalIndicatorPassed": chemical_passed,
                        "finalApprovalPassed": final_passed,
                        "tolerancePassed": tolerance_passed,
                        "calibrationPassed": tolerance_passed,
                        "equipmentStatus": "AVAILABLE" if (final_passed and tolerance_passed) else "QUARANTINED",
                        "trayStatus": "STERILIZED" if (cleaning_passed and chemical_passed) else "CONTAMINATED",
                        "notificationSent": True,
                        "certificateNumber": f"CERT-ISO11134-{int(time.time()) % 100000}",
                        "isoStandardCompliance": "ISO 17665 / EN 285"
                    }

                    # If this was Task_RegisterEquipment, elevate all unpacked variables to top level
                    if elem == "Task_RegisterEquipment" and unpacked:
                        vars_to_send.update(unpacked)

                    # If rework was executed, set cleaningPassed = True to exit rework loop
                    if elem == "Task_CleaningRework":
                        vars_to_send["cleaningPassed"] = True

                    # For quality inspection, preserve tray calibration state
                    if elem == "Task_QualityInspection":
                        vars_to_send["currentTray"] = {
                            "calibrationRequired": calib_required
                        }

                    # Execute completion
                    comp_url = f"{CAMUNDA_BASE}/v2/jobs/{jkey}/completion"
                    post_json(comp_url, {"variables": vars_to_send})
                    step_count += 1
                    print(f"[{time.strftime('%H:%M:%S')}] Step {step_count}: Node <{elem}> ({jtype}) Completed for Instance {inst}", flush=True)

                    # Interconnect: Sync step with Spring Boot backend so website advances in lockstep
                    sync_payload = {
                        "processInstanceId": str(inst),
                        "elementId": elem,
                        "requestId": vars_to_send.get("requestId", unpacked.get("requestId", raw_vars.get("requestId", ""))),
                        "equipmentId": vars_to_send.get("equipmentId", unpacked.get("equipmentId", raw_vars.get("equipmentId", ""))),
                        "department": vars_to_send.get("department", unpacked.get("department", raw_vars.get("department", ""))),
                        "assignedTechnician": vars_to_send.get("assignedTechnician", unpacked.get("assignedTechnician", raw_vars.get("assignedTechnician", ""))),
                        "status": "COMPLETED" if elem in ("Task_UpdateEquipmentStatus", "Task_GenerateSterilizationCert", "Task_SendNotification") else "IN_PROGRESS"
                    }
                    post_json("http://localhost:8085/api/workflows/sync-step", sync_payload)
                    time.sleep(1.2)

        # Print heartbeat every 15 seconds if idle so user knows daemon is alive
        if not work_done:
            now = time.time()
            if now - last_heartbeat > 15:
                print(f"[{time.strftime('%H:%M:%S')}] [DAEMON] Listening for incoming workflow instances... (Steps completed so far: {step_count})", flush=True)
                last_heartbeat = now
            time.sleep(0.3)

if __name__ == "__main__":
    run_daemon()
