import urllib.request
import urllib.error
import json
import time

CAMUNDA_BASE = "http://localhost:8080"
BPMN_PATH = r"C:\Users\ether\.gemini\antigravity\scratch\sterilflow\bpmn-models\sterilflow-main-process.bpmn"

def deploy():
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    with open(BPMN_PATH, "rb") as f:
        content = f.read()

    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="resources"; filename="sterilflow-main-process.bpmn"\r\n')
    body.extend(b"Content-Type: application/xml\r\n\r\n")
    body.extend(content)
    body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(f"{CAMUNDA_BASE}/v2/deployments", data=bytes(body), method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")

    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print("[DEPLOY] Successfully deployed!")
        processes = res.get("processes", [])
        for p in processes:
            print(f"  Process: {p.get('bpmnProcessId')} (Version: {p.get('version')}, Key: {p.get('processDefinitionKey')})")
        return processes

if __name__ == "__main__":
    deploy()
