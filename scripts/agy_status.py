import os
import sys
import json
import sqlite3
import re
import socket
import subprocess

def get_git_branch(path):
    try:
        # Run git branch query in the workspace path
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except Exception:
        return None

def main():
    home = os.path.expanduser("~")
    cli_dir = os.path.join(home, ".gemini", "antigravity-cli")
    settings_path = os.path.join(cli_dir, "settings.json")
    history_path = os.path.join(cli_dir, "history.jsonl")
    conversations_dir = os.path.join(cli_dir, "conversations")

    # 1. Load settings.json
    model_name = "Gemini 3.5 Flash"
    if os.path.exists(settings_path):
        try:
            with open(settings_path, "r", encoding="utf-8") as f:
                settings = json.load(f)
                model_name = settings.get("model", model_name)
        except Exception:
            pass

    # Clean up model name for display
    # e.g., "Gemini 3.5 Flash (Medium)" -> "Gemini 3.5 Flash"
    display_model = model_name
    for pattern in [" (Medium)", " (Large)", "-latest"]:
        display_model = display_model.replace(pattern, "")

    # Define context limit based on model name
    context_limit = 1048576  # Default 1M
    context_limit_str = "1M"
    if "pro" in display_model.lower() or "1.5-pro" in display_model.lower():
        context_limit = 2097152
        context_limit_str = "2M"
    elif "flash" in display_model.lower():
        context_limit = 1048576
        context_limit_str = "1M"

    # 2. Get last active workspace and conversation from history.jsonl
    workspace_path = os.getcwd()
    active_conv_id = None
    if os.path.exists(history_path):
        try:
            with open(history_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
                if lines:
                    last_line = json.loads(lines[-1].strip())
                    workspace_path = last_line.get("workspace", workspace_path)
                    active_conv_id = last_line.get("conversationId")
        except Exception:
            pass

    # 3. Find active conversation database
    db_file = None
    if active_conv_id:
        db_file = os.path.join(conversations_dir, f"{active_conv_id}.db")

    if not db_file or not os.path.exists(db_file):
        # Fallback: find the most recently modified .db file
        if os.path.exists(conversations_dir):
            db_files = [
                os.path.join(conversations_dir, f)
                for f in os.listdir(conversations_dir)
                if f.endswith(".db")
            ]
            if db_files:
                db_file = max(db_files, key=os.path.getmtime)
                active_conv_id = os.path.basename(db_file).replace(".db", "")

    # 4. Read database stats
    token_count = 0
    percentage = 0
    if db_file and os.path.exists(db_file):
        try:
            # Connect in read-only mode to prevent locking issues
            conn = sqlite3.connect(f"file:{db_file}?mode=ro", uri=True)
            cursor = conn.cursor()
            
            # Query the size of the latest gen_metadata row
            cursor.execute("SELECT LENGTH(data) FROM gen_metadata ORDER BY idx DESC LIMIT 1;")
            row = cursor.fetchone()
            if row and row[0]:
                blob_size = row[0]
                # Estimate: 1 token = 4 characters
                token_count = int(blob_size / 4)
                percentage = int((token_count / context_limit) * 100)
            
            conn.close()
        except Exception:
            pass

    # 5. Format status line
    username = os.environ.get("USERNAME") or os.environ.get("USER") or "user"
    hostname = socket.gethostname()
    
    # Path formatting (shorten home path to ~)
    display_path = workspace_path
    if display_path.lower().startswith(home.lower()):
        display_path = "~" + display_path[len(home):]
    display_path = display_path.replace("\\", "/")

    # Git branch
    branch = get_git_branch(workspace_path)
    git_str = f"git:(\033[31m{branch}\033[0m) " if branch else ""

    # Color definitions (ANSI codes)
    green = "\033[32m"
    blue = "\033[34m"
    cyan = "\033[36m"
    reset = "\033[0m"

    # Print the status line
    prompt_part = f"{green}{username}@{hostname}{reset} {blue}{display_path}{reset} {git_str}"
    status_part = f"{cyan}{display_model} ({context_limit_str} context){reset} \033[33mctx: {percentage}%\033[0m"
    
    print(f"\n{prompt_part}{status_part}")

if __name__ == "__main__":
    main()
