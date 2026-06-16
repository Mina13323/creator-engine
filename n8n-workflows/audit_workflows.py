import os
import json

directory = "C:\\Users\\Mina Wael\\Desktop\\CEO\\n8n-workflows"

# The nodes we will inject into every workflow for Global Error Handling
def get_error_nodes():
    return [
        {
            "parameters": {},
            "id": "error-trigger-node-uuid",
            "name": "Error Trigger",
            "type": "n8n-nodes-base.errorTrigger",
            "typeVersion": 1,
            "position": [200, 1000]
        },
        {
            "parameters": {
                "jsCode": "const errorData = $input.all()[0].json.execution.error;\nreturn {\n  success: false,\n  error: 'An internal workflow error occurred.',\n  log: errorData.message || 'Unknown error'\n};"
            },
            "id": "sanitize-error-node-uuid",
            "name": "Sanitize Error & Log",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [450, 1000]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "http://api.creatorengine.local/internal/alerts",
                "sendBody": True,
                "bodyParameters": {
                    "parameters": [
                        {
                            "name": "workflowName",
                            "value": "={{$workflow.name}}"
                        },
                        {
                            "name": "errorMsg",
                            "value": "={{$json.log}}"
                        }
                    ]
                },
                "options": {}
            },
            "id": "notify-failure-node-uuid",
            "name": "Notify Failure",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4,
            "position": [700, 1000]
        }
    ]

def get_error_connections():
    return {
        "Error Trigger": {
            "main": [
                [
                    {
                        "node": "Sanitize Error & Log",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Sanitize Error & Log": {
            "main": [
                [
                    {
                        "node": "Notify Failure",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        }
    }

for filename in os.listdir(directory):
    if filename.endswith(".json"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except Exception:
                continue

        if "nodes" not in data:
            continue

        # 1. Update existing HTTP Request nodes with retry logic
        for node in data["nodes"]:
            if node["type"] == "n8n-nodes-base.httpRequest" and "fireworks" in str(node.get("parameters", {})):
                # Add retry policy
                node["retryOnFail"] = True
                node["maxTries"] = 3
                node["waitBetweenTries"] = 2000
                
                # We can also add continueOnFail for explicit fallback logic inside the main workflow
                # but standard retry is safer to keep it clean.
                # To prevent exposing raw errors, we can set continueOnFail to false so it hits the Error Trigger.
                node["continueOnFail"] = False

        # 2. Add Error Handling Nodes if not already present
        has_error_trigger = any(n["type"] == "n8n-nodes-base.errorTrigger" for n in data["nodes"])
        if not has_error_trigger:
            data["nodes"].extend(get_error_nodes())
            if "connections" not in data:
                data["connections"] = {}
            data["connections"].update(get_error_connections())
            
        # 3. Update Settings to ensure clean errors and proper tracking
        if "settings" not in data:
            data["settings"] = {}
            
        data["settings"]["saveDataErrorExecution"] = "all"
        data["settings"]["saveDataSuccessExecution"] = "none"
        data["settings"]["saveManualExecutions"] = True
        data["settings"]["callerPolicy"] = "workflowsFromSameOwner"
        data["settings"]["errorWorkflow"] = ""

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

print("Workflows updated successfully.")
