import sys
import json
import os
import sqlite3

def main():
    try:
        # 1. Read JSON from stdin
        input_data = sys.stdin.read().strip()
        if not input_data:
            # Fallback output
            sys.stdout.write("agy statusline (no payload)")
            return
            
        payload = json.loads(input_data)
        cwd = payload.get("cwd", os.getcwd())
        conv_id = payload.get("conversation_id")
        model_name = payload.get("model", "Gemini 3.5 Flash")

        # Clean model name
        display_model = model_name
        for pattern in [" (Medium)", " (Large)", "-latest"]:
            display_model = display_model.replace(pattern, "")

        # Determine context limit
        context_limit = 1048576  # Default 1M
        context_limit_str = "1M"
        if "pro" in display_model.lower() or "1.5-pro" in display_model.lower():
            context_limit = 2097152
            context_limit_str = "2M"
        elif "flash" in display_model.lower():
            context_limit = 1048576
            context_limit_str = "1M"

        # 2. Get database stats if conversation_id is available
        percentage = 0
        if conv_id:
            home = os.path.expanduser("~")
            db_file = os.path.join(home, ".gemini", "antigravity-cli", "conversations", f"{conv_id}.db")
            if os.path.exists(db_file):
                try:
                    conn = sqlite3.connect(f"file:{db_file}?mode=ro", uri=True)
                    cursor = conn.cursor()
                    cursor.execute("SELECT LENGTH(data) FROM gen_metadata ORDER BY idx DESC LIMIT 1;")
                    row = cursor.fetchone()
                    if row and row[0]:
                        blob_size = row[0]
                        token_count = int(blob_size / 4)
                        percentage = int((token_count / context_limit) * 100)
                    conn.close()
                except Exception:
                    pass

        # 3. Format colorized TUI status line using ANSI colors
        # Cyan for model name, green for context window, yellow/orange for ctx percentage
        cyan = "\033[36m"
        green = "\033[32m"
        yellow = "\033[33m"
        reset = "\033[0m"
        
        status_str = f"Model: {cyan}{display_model}{reset} ({green}{context_limit_str} context{reset}) | {yellow}ctx: {percentage}%{reset}"
        
        sys.stdout.write(status_str)
    except Exception as e:
        sys.stdout.write(f"statusline err: {str(e)}")

if __name__ == "__main__":
    main()
