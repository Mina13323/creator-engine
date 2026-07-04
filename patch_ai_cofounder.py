import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\web\src\app\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import AIConsultantDashboard
if 'AIConsultantDashboard' not in content:
    content = re.sub(
        r"import AIStudioPanel from '\.\./components/AIStudioPanel';",
        "import AIStudioPanel from '../components/AIStudioPanel';\nimport AIConsultantDashboard from '../components/AIConsultantDashboard';",
        content
    )

# 2. Add AI Cofounder to sidebar
if "id: 'ai-consultant'" not in content:
    content = re.sub(
        r"\{ id: 'ai-studio', label: 'AI Studio', icon: ImagePlus, requiresProject: false \},",
        "{ id: 'ai-consultant', label: 'AI Cofounder', icon: MessageSquare, requiresProject: true },\n    { id: 'ai-studio', label: 'AI Studio', icon: ImagePlus, requiresProject: false },",
        content
    )

# 3. Render AIConsultantDashboard
if "<AIConsultantDashboard />" not in content:
    content = re.sub(
        r"\{activeTab === 'ai-studio' && <AIStudioPanel />\}",
        "{activeTab === 'ai-studio' && <AIStudioPanel />}\n            {activeTab === 'ai-consultant' && <AIConsultantDashboard />}",
        content
    )

# 4. Remove ai-consultant from fallbacks
content = re.sub(
    r"\['guides', 'ai-consultant', 'pitch', 'radar', 'market-research'\]",
    "['guides', 'pitch', 'radar', 'market-research']",
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched page.tsx for AI Cofounder")
