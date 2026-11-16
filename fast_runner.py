import urllib.request
import urllib.error
import json
import time
import sys

CAMUNDA_BASE = "http://localhost:8080"
ES_BASE = "http://localhost:9200"

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
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        return None
    except Exception as e:
        return None

def get_json(url):
    try:
        with urllib.request.urlopen(url) as resp:
            content = resp.read().decode("utf-8")
            return json.loads(content) if content else {}
    except Exception:
        return None

def start_instance(scenario="happy_path"):
    req_id = f"REQ-OR-{int(time.time()) % 10000}"
    calibration_needed = (scenario == "calibration")
    
    variables = {
        "requestId": req_id,
        "equipmentId": "EQ-STERIL-007",
        "department": "Orthopedic Surgery OR-3",
        "priority": "HIGH",
        "surgicalTrays": [
            {
                "trayId": f"TRAY-{req_id}-A",
                "trayName": "Total Hip Arthroplasty Set",
                "instrumentCount": 28,
                "calibrationRequired": calibration_needed
            },
            {
                "trayId": f"TRAY-{req_id}-B",
                "trayName": "Femoral Broach & Reamer System",
                "instrumentCount": 16,
                "calibrationRequired": False
            }
        ],
        "cleaningPassed": True,
        "chemicalIndicatorPassed": True,
        "finalApprovalPassed": True,
        "equipmentStatus": "AVAILABLE"
    }

    url = f"{CAMUNDA_BASE}/v2/process-instances"
    payload = {
        "processDefinitionId": "sterilflow-main-process",
        "variables": variables
    }
    res = post_json(url, payload)
    if res and "processInstanceKey" in res:
        pkey = res["processInstanceKey"]
        print(f"\n=======================================================", flush=True)
        print(f" [CAMUNDA 8] Started Instance: {pkey} (Scenario: {scenario})", flush=True)
        print(f" [OPERATE URL] http://localhost:8080/operate/processes/{pkey}", flush=True)
        print(f"=======================================================\n", flush=True)
        return pkey
    else:
        print("[ERROR] Failed to start process instance:", res, flush=True)
        return None

def get_instance_state(pkey):
    res = post_json(f"{ES_BASE}/operate-list-view-8.3.0_*/_search", {
        "query": {"term": {"key": int(pkey)}}
    })
    if res and res.get("hits", {}).get("hits"):
        return res["hits"]["hits"][0]["_source"].get("state")
    return "UNKNOWN"

def run_loop(target_instance=None, max_iterations=60):
    vars_map = {
        "equipmentRegistered": True,
        "cleaningPassed": True,
        "chemicalIndicatorPassed": True,
        "calibrationPassed": True,
        "finalApprovalPassed": True,
        "equipmentStatus": "AVAILABLE",
        "lastSterilizedAt": "2026-11-16T13:30:00Z",
        "certificateNumber": f"CERT-ISO11134-{int(time.time()) % 100000}",
        "isoStandardCompliance": "ISO 17665 / EN 285 (Medical Sterilization)",
        "notificationSent": True,
        "currentTray": {
            "calibrationRequired": False
        }
    }

    print(f"Beginning automated step-by-step token advancement...", flush=True)
    
    for it in range(max_iterations):
        active_found = False
        
        for jtype in JOB_TYPES:
            act_payload = {
                "type": jtype,
                "timeout": 15000,
                "maxJobsToActivate": 10,
                "requestTimeout": 100,
                "worker": "fast-runner"
            }
            res = post_json(f"{CAMUNDA_BASE}/v2/jobs/activation", act_payload)
            if res and "jobs" in res and res["jobs"]:
                active_found = True
                for job in res["jobs"]:
                    jkey = job["jobKey"]
                    elem = job.get("elementId")
                    inst = job.get("processInstanceKey")
                    print(f"  [+] Completed Node: <{elem}> | JobType: {jtype} | Instance: {inst}", flush=True)
                    post_json(f"{CAMUNDA_BASE}/v2/jobs/{jkey}/completion", {"variables": vars_map})

        # Also complete any user tasks via /v2/user-tasks if applicable
        ut_search = post_json(f"{CAMUNDA_BASE}/v2/user-tasks/search", {"state": "CREATED", "pageSize": 5})
        if ut_search and "items" in ut_search and ut_search["items"]:
            for ut in ut_search["items"]:
                ukey = ut.get("userTaskKey") or ut.get("key")
                elem = ut.get("elementId")
                inst = ut.get("processInstanceKey")
                if ukey:
                    active_found = True
                    print(f"  [+] Completed UserTask: <{elem}> | Key: {ukey} | Instance: {inst}", flush=True)
                    post_json(f"{CAMUNDA_BASE}/v2/user-tasks/{ukey}/completion", {"variables": vars_map})

        if target_instance:
            st = get_instance_state(target_instance)
            if st == "COMPLETED":
                print(f"\n>>> SUCCESS! Instance {target_instance} reached COMPLETED! <<<", flush=True)
                print(f"All flow nodes from Start to 'Equipment Released for Surgery' executed successfully!\n", flush=True)
                return True
                
        if not active_found:
            time.sleep(0.5)

    if target_instance:
        print(f"Final State for {target_instance}: {get_instance_state(target_instance)}", flush=True)
    return False

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    if target and target.isdigit():
        print(f"Advancing existing instance: {target}", flush=True)
        run_loop(target_instance=target, max_iterations=40)
    else:
        inst = start_instance("happy_path")
        if inst:
            run_loop(target_instance=str(inst), max_iterations=50)
