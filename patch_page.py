import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\web\src\app\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
if 'CreditIndicator' not in content:
    content = re.sub(
        r"import AuthModal from '../components/AuthModal';",
        "import AuthModal from '../components/AuthModal';\nimport CreditIndicator from '../components/CreditIndicator';\nimport PricingModal from '../components/PricingModal';",
        content
    )

# Sidebar Upgrade Button
content = re.sub(
    r'<button className="w-full bg-\[#1e293b\] hover:bg-slate-800 text-white font-semibold rounded-full py-2\.5 text-sm transition-colors mb-4">\s*Upgrade\s*</button>',
    '<button onClick={() => useStore.getState().setShowPricingModal(true)} className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-semibold rounded-full py-2.5 text-sm transition-colors mb-4">\n            Upgrade\n          </button>',
    content
)

# Header navbar credits
content = re.sub(
    r'<span className="text-slate-500 text-xs font-semibold bg-slate-50 px-3 py-1 rounded-full border border-slate-100">\s*\{userDisplayName\}\s*</span>',
    '<CreditIndicator />\n            <span className="text-slate-500 text-xs font-semibold bg-slate-50 px-3 py-1 rounded-full border border-slate-100">\n              {userDisplayName}\n            </span>',
    content
)

# Add PricingModal to bottom
content = re.sub(
    r'<AuthModal />\s*</div>\s*\);\s*\}',
    '<AuthModal />\n    <PricingModal />\n  </div>\n  );\n}',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched page.tsx")
