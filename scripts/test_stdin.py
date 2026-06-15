import sys
import json
import os

log_path = r"C:\Users\Mina Wael\Desktop\CEO\scripts\stdin_log.txt"

try:
    # Read stdin
    input_data = sys.stdin.read()
    
    # Log the input data
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(f"--- {os.getpid()} ---\n")
        f.write(input_data)
        f.write("\n")
        
    # Parse payload if possible
    payload = json.loads(input_data)
    model = payload.get("model", "Gemini 3.5 Flash")
    
    # Output simple status
    sys.stdout.write(f"Model: {model} | Connected")
except Exception as e:
    sys.stdout.write(f"Error: {str(e)}")
