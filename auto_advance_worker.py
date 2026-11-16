import time
import json
import urllib.request
import urllib.error

CAMUNDA_BASE = "http://localhost:8080"

JOB_TYPES = [
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

def post_json(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        # print(f"HTTPError on {url}: {e.code} - {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        return None

def process_jobs():
    for jtype in JOB_TYPES:
        act_payload = {
            "type": jtype,
            "timeout": 30000,
            "maxJobsToActivate": 20,
            "worker": "sterilflow-auto-worker"
        }
        res = post_json(f"{CAMUNDA_BASE}/v2/jobs/activation", act_payload)
        if res and "jobs" in res:
            for job in res["jobs"]:
                jkey = job["jobKey"]
                print(f"[JOB] Completing {jtype} (Key: {jkey}) for instance {job.get('processInstanceKey')}")
                complete_payload = {
                    "variables": {
                        "equipmentRegistered": True,
                        "cleaningPassed": True,
                        "chemicalIndicatorPassed": True,
                        "calibrationPassed": True,
                        "finalApprovalPassed": True,
                        "equipmentStatus": "AVAILABLE"
                    }
                }
                post_json(f"{CAMUNDA_BASE}/v2/jobs/{jkey}/completion", complete_payload)

def process_user_tasks():
    search_payload = {
        "state": "CREATED",
        "pageSize": 20
    }
    res = post_json(f"{CAMUNDA_BASE}/v2/user-tasks/search", search_payload)
    if res and "items" in res:
        for ut in res["items"]:
            ukey = ut.get("userTaskKey") or ut.get("key")
            if ukey:
                print(f"[USER TASK] Completing User Task (Key: {ukey}) for instance {ut.get('processInstanceKey')}")
                comp_payload = {
                    "variables": {
                        "cleaningPassed": True,
                        "visualInspectionScore": "PASSED",
                        "chemicalIndicatorPassed": True,
                        "finalApprovalPassed": True,
                        "calibrationPassed": True
                    }
                }
                post_json(f"{CAMUNDA_BASE}/v2/user-tasks/{ukey}/completion", comp_payload)

if __name__ == "__main__":
    print("Sterilflow Auto-Advance Worker Service Started...")
    while True:
        try:
            process_jobs()
            process_user_tasks()
        except Exception as e:
            print("Loop error:", e)
        time.sleep(1)
