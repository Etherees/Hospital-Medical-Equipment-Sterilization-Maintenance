import urllib.request
import urllib.error
import json
import time
import sys

CAMUNDA_BASE = "http://localhost:8080"

JOB_TYPES = [
    "register-equipment",
    "verify-cleaning",
    "execute-sterilization-cycle",
    "verify-chemical-indicator",
    "update-equipment-status",
    "generate-sterilization-certificate",
    "send-notification",
    "io.camunda:email:1",
    "io.camunda.zeebe:userTask",
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
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        # print(f"HTTPError on {url}: {e.code} - {e.read().decode('utf-8')}", flush=True)
        return None
    except Exception as e:
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
        print(f"\n[START] Started Sterilflow Process Instance: {pkey}", flush=True)
        print(f"[OPERATE URL] http://localhost:8080/operate/processes/{pkey}\n", flush=True)
        return pkey
    else:
        print("[ERROR] Failed to start process instance:", res, flush=True)
        return None

def poll_and_advance(target_instance=None, max_steps=40):
    print(f"Advancing workflow execution...", flush=True)
    vars_map = {
        "equipmentRegistered": True,
        "cleaningPassed": True,
        "chemicalIndicatorPassed": True,
        "calibrationPassed": True,
        "finalApprovalPassed": True,
        "equipmentStatus": "AVAILABLE",
        "currentTray": {
            "calibrationRequired": False
        }
    }
    
    for step in range(max_steps):
        found = False
        # 1. Check Service Task Jobs
        for jtype in JOB_TYPES:
            act_payload = {
                "type": jtype,
                "timeout": 10000,
                "maxJobsToActivate": 10,
                "worker": "sterilflow-master-runner"
            }
            res = post_json(f"{CAMUNDA_BASE}/v2/jobs/activation", act_payload)
            if res and "jobs" in res:
                for job in res["jobs"]:
                    found = True
                    jkey = job["jobKey"]
                    elem = job.get("elementId")
                    inst = job.get("processInstanceKey")
                    print(f"  -> Completed Job [{jtype}] on node <{elem}> (Instance: {inst})", flush=True)
                    post_json(f"{CAMUNDA_BASE}/v2/jobs/{jkey}/completion", {"variables": vars_map})

        # 2. Check User Tasks
        ut_res = post_json(f"{CAMUNDA_BASE}/v2/user-tasks/search", {"state": "CREATED", "pageSize": 10})
        if ut_res and "items" in ut_res:
            for ut in ut_res["items"]:
                ukey = ut.get("userTaskKey") or ut.get("key")
                elem = ut.get("elementId")
                inst = ut.get("processInstanceKey")
                if ukey:
                    found = True
                    print(f"  -> Completed User Task <{elem}> (Key: {ukey}, Instance: {inst})", flush=True)
                    post_json(f"{CAMUNDA_BASE}/v2/user-tasks/{ukey}/completion", {"variables": vars_map})

        if not found:
            time.sleep(0.6)
            
    print("[DONE] Flow execution advancement cycle complete.", flush=True)

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "run"
    if mode == "run":
        inst = start_instance("happy_path")
        if inst:
            poll_and_advance(inst, max_steps=35)
    elif mode == "worker":
        print("Running in background worker mode...", flush=True)
        while True:
            poll_and_advance(max_steps=5)
            time.sleep(1)
