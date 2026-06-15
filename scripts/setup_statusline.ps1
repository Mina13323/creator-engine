# Setup script for Antigravity CLI Status Line in PowerShell
# This script configures a "/statusline" command and a dynamic prompt in the user's PowerShell Profile.

$ProfilePath = $PROFILE
$ProfileDir = Split-Path $ProfilePath

if (-not (Test-Path $ProfileDir)) {
    New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null
}

$ScriptPath = "C:\Users\Mina Wael\Desktop\CEO\scripts\agy_status.py"

# Define the PowerShell code to append to the profile
$ProfileAddition = @"

# --- Antigravity CLI status line configuration ---
function /statusline {
    python "$ScriptPath"
}

# Dynamic Prompt with Antigravity Session Stats
function Enable-AgyPrompt {
    if (-not `$script:old_prompt) {
        # Backup the current prompt function
        `$script:old_prompt = Get-Command prompt -ErrorAction SilentlyContinue
    }
    
    function global:prompt {
        python "$ScriptPath"
        return ">> "
    }
    Write-Host "Antigravity CLI prompt enabled! Type 'Disable-AgyPrompt' to restore the default prompt." -ForegroundColor Green
}

function Disable-AgyPrompt {
    if (`$script:old_prompt) {
        # Restore the old prompt
        `$old_prompt_code = `$script:old_prompt.Definition
        Invoke-Expression "function global:prompt { `$old_prompt_code }"
        Remove-Variable -Name old_prompt -Scope script -ErrorAction SilentlyContinue
    } else {
        # Default fallback prompt
        function global:prompt {
            return "PS `$pwd> "
        }
    }
    Write-Host "Default PowerShell prompt restored." -ForegroundColor Yellow
}
# --------------------------------------------------
"@

# Read existing profile content to check if it's already added
if (Test-Path $ProfilePath) {
    $ExistingContent = Get-Content -Path $ProfilePath -Raw
} else {
    $ExistingContent = ""
}

if ($ExistingContent -notlike "*Antigravity CLI status line configuration*") {
    Add-Content -Path $ProfilePath -Value $ProfileAddition
    Write-Host "Successfully added /statusline and Enable-AgyPrompt functions to your PowerShell Profile!" -ForegroundColor Green
    Write-Host "Profile path: $ProfilePath" -ForegroundColor Cyan
} else {
    Write-Host "Antigravity status line configuration is already present in your PowerShell Profile." -ForegroundColor Yellow
}

# Auto-enable for the current session as well
/statusline
