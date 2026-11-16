import urllib.request, json, time

CAMUNDA_BASE = "http://localhost:8080"
ALL_JOB_TYPES = [
    "register-equipment",
    "io.camunda.zeebe:userTask",
    "verify-cleaning",
    "io.camunda:http-json:1",
    "execute-sterilization-cycle",
    "verify-chemical-indicator",
    "update-equipment-status",
    "generate-sterilization-certificate",
    "io.camunda:email:1",
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

default_vars = {
    "equipmentRegistered": True,
    "cleaningPassed": True,
    "chemicalIndicatorPassed": True,
    "finalApprovalPassed": True,
    "calibrationPassed": True,
    "equipmentStatus": "AVAILABLE",
    "visualInspectionScore": "PASSED"
}

def step():
    found_any = False
    for jtype in ALL_JOB_TYPES:
        act_payload = {
            "type": jtype,
            "timeout": 30000,
            "maxJobsToActivate": 20,
            "worker": "sterilflow-auto-worker"
        }
        req = urllib.request.Request(f"{CAMUNDA_BASE}/v2/jobs/activation", data=json.dumps(act_payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
        try:
            with urllib.request.urlopen(req) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                jobs = res.get("jobs", [])
                if jobs:
                    found_any = True
                    for job in jobs:
                        jkey = job["jobKey"]
                        elem = job.get("elementId")
                        inst = job.get("processInstanceKey")
                        print(f"-> Completing job [{jtype}] (Elem: {elem}, Inst: {inst})")
                        comp_req = urllib.request.Request(
                            f"{CAMUNDA_BASE}/v2/jobs/{jkey}/completion",
                            data=json.dumps({"variables": default_vars}).encode('utf-8'),
                            headers={'Content-Type': 'application/json'},
                            method='POST'
                        )
                        try:
                            with urllib.request.urlopen(comp_req) as cresp:
                                pass
                        except Exception as e:
                            print(f"Error completing {jkey}: {e}")
        except Exception as e:
            # print(f"Error activating {jtype}: {e}")
            pass
    return found_any

print("Starting auto-advance pipeline...")
for i in range(25):
    res = step()
    if not res:
        print("No more pending jobs. Checking again in 1s...")
    time.sleep(1)
print("Pipeline complete!")
