import json
import os
import glob

workflow_dir = r'C:\Users\Mina Wael\Desktop\CEO\n8n-workflows'
files = glob.glob(os.path.join(workflow_dir, '*.json'))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            continue
            
    modified = False
    
    for node in data.get('nodes', []):
        if node.get('type') == 'n8n-nodes-base.webhook':
            if node.get('parameters', {}).get('authentication') != 'headerAuth':
                node['parameters']['authentication'] = 'headerAuth'
                # Also we can add credentials map so it imports cleanly if they create one named 'Creator Engine API Key'
                if 'credentials' not in node:
                    node['credentials'] = {
                        'httpHeaderAuth': {
                            'id': '',
                            'name': 'Creator Engine API Key'
                        }
                    }
                modified = True
                
        if node.get('type') == 'n8n-nodes-base.httpRequest':
            params = node.get('parameters', {})
            header_params = params.get('headerParameters', {}).get('parameters', [])
            for param in header_params:
                if param.get('name') == 'Authorization':
                    val = param.get('value', '')
                    if 'YOUR_FIREWORKS_API_KEY' in val or 'Bearer' in val and '$env' not in val:
                        param['value'] = '={{"Bearer " + $env.FIREWORKS_API_KEY}}'
                        modified = True
                        
    if modified:
        with open(file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Updated {os.path.basename(file)}")
