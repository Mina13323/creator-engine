import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\web\src\store\useStore.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the broken block from logout completely
bad_logout_block = """    set({
      user: null,
      isAuthenticated: false,
  credits: 0,
  isDemo: false,
  showPricingModal: false,
  setShowPricingModal: (show) => set({ showPricingModal: show }),
  loadCredits: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/credits', { headers: { Authorization: `Bearer ${get().user?.token}` } });
      const data = await res.json();
      if (data.wallet) {
        set({ credits: data.wallet.availableCredits, isDemo: !!data.isDemo });
      }
    } catch (e) {}
  },
      isOnboarded: false,"""

good_logout_block = """    set({
      user: null,
      isAuthenticated: false,
      credits: 0,
      isDemo: false,
      showPricingModal: false,
      isOnboarded: false,"""

content = content.replace(bad_logout_block, good_logout_block)

# Add the correct block to the root of the store
missing_root_block = """  user: null,
  isAuthModalOpen: false,
  isAuthenticated: false,

  credits: 0,
  isDemo: false,
  showPricingModal: false,
  setShowPricingModal: (show) => set({ showPricingModal: show }),
  loadCredits: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/credits', { headers: { Authorization: `Bearer ${get().user?.token}` } });
      const data = await res.json();
      if (data.wallet) {
        set({ credits: data.wallet.availableCredits, isDemo: !!data.isDemo });
      }
    } catch (e) {}
  },"""

content = content.replace(
    "  user: null,\n  isAuthModalOpen: false,\n  isAuthenticated: false,\n\n\n  setAuthModalOpen",
    missing_root_block + "\n\n  setAuthModalOpen"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed useStore.ts")
