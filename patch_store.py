import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\web\src\store\useStore.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the duplicated block
duplicate_block = """  credits: 0,
  showPricingModal: false,
  setShowPricingModal: (show) => set({ showPricingModal: show }),
  loadCredits: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/credits', { headers: { Authorization: `Bearer ${get().user?.token}` } });
      const data = await res.json();
      if (data.wallet) {
        set({ credits: data.wallet.availableCredits });
      }
    } catch (e) {}
  },"""

if content.count(duplicate_block) > 1:
    content = content.replace(duplicate_block, "", 1) # remove one instance

# Add isDemo to interface StoreState
if "isDemo: boolean;" not in content:
    content = re.sub(
        r"credits: number;",
        "credits: number;\n  isDemo: boolean;",
        content
    )

# Add isDemo to initial state
if "isDemo: false," not in content:
    content = re.sub(
        r"credits: 0,",
        "credits: 0,\n  isDemo: false,",
        content
    )

# Update loadCredits to parse isDemo
content = re.sub(
    r"set\(\{ credits: data\.wallet\.availableCredits \}\);",
    "set({ credits: data.wallet.availableCredits, isDemo: !!data.isDemo });",
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed useStore.ts")
