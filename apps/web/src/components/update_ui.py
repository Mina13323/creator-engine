import os
import re

components_dir = "C:\\Users\\Mina Wael\\Desktop\\CEO\\apps\\web\\src\\components"
files_to_update = [
    "BusinessPlanDashboard.tsx",
    "BrandingPanel.tsx",
    "MarketingDashboard.tsx",
    "PitchDashboard.tsx",
    "OpportunityExplorer.tsx"
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "AILoadingOverlay" not in content:
        # Add import at the top
        content = content.replace("import React", "import { AILoadingOverlay } from './ui/AILoadingOverlay';\nimport React")

    # The pattern for the old loading block usually looks like:
    # return (
    #   <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-in fade-in">
    #     <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
    #     <div className="text-center">
    #       <h2 className="text-xl font-semibold text-slate-800">...</h2>
    #       ...
    #     </div>
    #   </div>
    # );
    
    # We can match `return (\n      <div className="flex flex-col items-center justify-center h-[60vh]...`
    # up to `</div>\n    );` if it contains `Loader2 className="w-12 h-12`
    
    pattern = re.compile(r'return \(\s*<div className="flex flex-col items-center justify-center h-\[60vh\][^>]*>.*?<Loader2 className="w-12 h-12.*?<h2[^>]*>(.*?)</h2>.*?</div>\s*\);', re.DOTALL)
    
    def replacer(match):
        message = match.group(1).replace('{loadingMessage || \'', '').replace('\'}', '').replace('{loadingMessage}', 'Generating...')
        message = re.sub(r'\{.*?\}', '', message) # strip any inner vars just in case
        if "loadingMessage" in match.group(1):
            return f'return <AILoadingOverlay message={{loadingMessage || "{message.strip()}"}} />;'
        return f'return <AILoadingOverlay message="{message.strip()}" />;'
    
    content = pattern.sub(replacer, content)

    # Disable buttons during generation:
    # We look for <Button and add disabled if it has an onClick that calls a generator.
    # Actually, the button isn't visible when loading because the whole dashboard is replaced by the loading block!
    # But for "Regenerate" buttons that might exist in the top bar, let's add disabled={loading} or disabled={brandingLoading}
    
    if "BrandingPanel" in filepath:
        content = content.replace("onClick={handleGenerateBranding}", "onClick={handleGenerateBranding} disabled={brandingLoading}")
    elif "PitchDashboard" in filepath:
        content = content.replace("onClick={handleGeneratePitch}", "onClick={handleGeneratePitch} disabled={pitchLoading}")
    elif "MarketingDashboard" in filepath:
        content = content.replace("onClick={handleGenerateMarketing}", "onClick={handleGenerateMarketing} disabled={marketingLoading}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for filename in files_to_update:
    process_file(os.path.join(components_dir, filename))

print("Updated AI components.")
