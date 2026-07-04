import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\web\src\lib\authClient.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add logic inside request() right after status === 401 check
error_handler = """  if (res.status === 402) {
    const data = await res.json();
    const { useStore } = await import('../store/useStore');
    useStore.getState().setShowPricingModal(true);
    throw new Error(data.message || 'Insufficient AI credits.');
  }
  if (res.status === 403) {
    const data = await res.json();
    if (data.error === 'SUBSCRIPTION_REQUIRED') {
      const { useStore } = await import('../store/useStore');
      useStore.getState().setShowPricingModal(true);
      throw new Error(`Subscription required: ${data.requiredPlan}`);
    }
  }
"""

if "res.status === 402" not in content:
    content = re.sub(
        r"  const data = await res\.json\(\);",
        error_handler + "\n  const data = await res.json();",
        content
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched authClient.ts")
