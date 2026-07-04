import re

# 1. Add verify-redirect to backend
api_filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\routes\payments.ts'
with open(api_filepath, 'r', encoding='utf-8') as f:
    api_content = f.read()

verify_route = """
// Localhost testing redirect handler
router.post('/paymob/verify-redirect', async (req: Request, res: Response): Promise<any> => {
  try {
    const { merchant_order_id, success } = req.body;
    
    if (!merchant_order_id) return res.status(400).json({ error: 'Missing merchant_order_id' });

    const tx = await PaymentTransactionModel.findOne({ paymentIntentId: merchant_order_id });
    if (!tx) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    if (tx.status === 'paid') {
        return res.status(200).json({ message: 'Already processed', wallet: await CreditWalletModel.findOne({ userId: tx.userId }) });
    }

    if (success === 'true' || success === true) {
        tx.status = 'paid';
        await tx.save();

        if (tx.metadata && tx.metadata.packId) {
            const pack = await CreditPackModel.findById(tx.metadata.packId);
            if (pack) {
                const wallet = await CreditWalletModel.findOne({ userId: tx.userId });
                if (wallet) {
                    wallet.availableCredits += pack.credits;
                    wallet.totalPurchasedCredits += pack.credits;
                    await wallet.save();
                    return res.status(200).json({ message: 'Processed', wallet });
                }
            }
        }
    } else {
        tx.status = 'failed';
        await tx.save();
    }
    
    return res.status(200).json({ message: 'Processed' });
  } catch (err: any) {
    console.error('Verify redirect error:', err);
    return res.status(500).json({ error: err.message });
  }
});
"""

if "paymob/verify-redirect" not in api_content:
    api_content = api_content.replace("router.post('/paymob/webhook'", verify_route + "\nrouter.post('/paymob/webhook'")
    with open(api_filepath, 'w', encoding='utf-8') as f:
        f.write(api_content)
    print("Patched payments.ts")


# 2. Add useEffect to frontend page.tsx
web_filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\web\src\app\page.tsx'
with open(web_filepath, 'r', encoding='utf-8') as f:
    web_content = f.read()

import_toast = "import toast, { Toaster } from 'react-hot-toast';"
if import_toast not in web_content:
    web_content = web_content.replace("import React, { useEffect, useState } from 'react';", "import React, { useEffect, useState } from 'react';\n" + import_toast)

use_effect_redirect = """
  // Check for Paymob redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const merchantOrderId = urlParams.get('merchant_order_id');

    if (success && merchantOrderId && isAuthenticated) {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (success === 'true') {
        const verifyPayment = async () => {
          const res = await fetch('http://localhost:5000/api/payments/paymob/verify-redirect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useStore.getState().user?.token}` },
            body: JSON.stringify({ merchant_order_id: merchantOrderId, success })
          });
          if (res.ok) {
            toast.success('Payment successful! Credits added to your wallet.');
            useStore.getState().loadCredits();
          }
        };
        verifyPayment();
      } else {
        toast.error('Payment failed or was cancelled.');
      }
    }
  }, [isAuthenticated]);
"""

if "Check for Paymob redirect" not in web_content:
    web_content = web_content.replace("  // Route protection disabled for open UI development", use_effect_redirect + "\n  // Route protection disabled for open UI development")

if "<Toaster />" not in web_content:
    web_content = web_content.replace("      {/* Mobile Header */}", "      <Toaster />\n      {/* Mobile Header */}")

with open(web_filepath, 'w', encoding='utf-8') as f:
    f.write(web_content)
print("Patched page.tsx")
