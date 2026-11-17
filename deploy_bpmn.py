import urllib.request
import uuid

url = 'http://localhost:8080/v2/deployments'
boundary = '----WebKitFormBoundary' + uuid.uuid4().hex

with open(r'C:\Users\ether\.gemini\antigravity\scratch\sterilflow\bpmn-models\sterilflow-main-process.bpmn', 'rb') as f:
    bpmn_bytes = f.read()

part1 = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="resources"; filename="sterilflow-main-process.bpmn"\r\n'
    f'Content-Type: text/xml\r\n\r\n'
).encode('utf-8')
part2 = f'\r\n--{boundary}--\r\n'.encode('utf-8')
body = part1 + bpmn_bytes + part2

req = urllib.request.Request(url, data=body, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
try:
    with urllib.request.urlopen(req) as resp:
        print('Status:', resp.status)
        print('Response:', resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code, e.read().decode('utf-8'))
except Exception as e:
    print('Error:', e)
