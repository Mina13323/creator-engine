import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware';
import { PaymentTransactionModel, UserSubscriptionModel } from '@creator/database';
import { addCredits } from '../services/creditEngine';
import crypto from 'crypto';

const router = express.Router();

import { SubscriptionPlanModel, CreditPackModel, CreditWalletModel } from '@creator/database';

router.get('/plans', async (req: Request, res: Response): Promise<any> => {
  try {
    const plans = await SubscriptionPlanModel.find({ isActive: true });
    return res.status(200).json({ plans });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/packs', async (req: Request, res: Response): Promise<any> => {
  try {
    const packs = await CreditPackModel.find({ isActive: true });
    return res.status(200).json({ packs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Route to Seed Plans
router.post('/seed', async (req: Request, res: Response): Promise<any> => {
  try {
    if (process.env.NODE_ENV === 'production' && !req.headers.authorization) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    const plans = [
        { name: 'Free', slug: 'free', monthlyPriceEGP: 0, monthlyCredits: 100, maxProjects: 1, features: ['Basic Features'] },
        { name: 'Starter', slug: 'starter', monthlyPriceEGP: 499, monthlyCredits: 1000, maxProjects: 3, features: ['Advanced Features'] },
        { name: 'Pro', slug: 'pro', monthlyPriceEGP: 999, monthlyCredits: 5000, maxProjects: 10, features: ['Pro Features'] },
        { name: 'Agency', slug: 'agency', monthlyPriceEGP: 2999, monthlyCredits: 20000, maxProjects: 999, features: ['All Features', 'Priority Support'] },
    ];

    const packs = [
        { name: 'Pack A', slug: 'pack_a', priceEGP: 199, credits: 500 },
        { name: 'Pack B', slug: 'pack_b', priceEGP: 799, credits: 2500 },
        { name: 'Pack C', slug: 'pack_c', priceEGP: 1999, credits: 10000 },
    ];

    for (const p of plans) {
        await SubscriptionPlanModel.findOneAndUpdate({ slug: p.slug }, p, { upsert: true });
    }
    for (const p of packs) {
        await CreditPackModel.findOneAndUpdate({ slug: p.slug }, p, { upsert: true });
    }

    return res.status(200).json({ message: 'Seeded successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});




const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || '';
const PAYMOB_HMAC = process.env.PAYMOB_HMAC || '';
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || '';
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID || '';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

router.post('/paymob/create', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { type, planId, packId, amountEGP } = req.body;

    if (!amountEGP) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const paymentIntentId = `pi_${Date.now()}`;
    
    const tx = new PaymentTransactionModel({
      userId,
      amountEGP,
      paymentProvider: 'paymob',
      paymentIntentId,
      status: 'pending',
      metadata: { type, planId, packId }
    });
    
    await tx.save();

    if (DEMO_MODE || !PAYMOB_API_KEY) {
      console.warn('Paymob is running in DEMO or missing API_KEY mode. Returning sandbox checkout URL.');
      return res.status(200).json({ 
        checkoutUrl: `/checkout/sandbox?intent=${paymentIntentId}&amount=${amountEGP}`,
        paymentIntentId 
      });
    }

    // 1. Authenticate with Paymob to get auth token
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: PAYMOB_API_KEY })
    });
    const authData = await authRes.json();
    if (!authData.token) throw new Error('Paymob authentication failed');
    const authToken = authData.token;

    // 2. Create order registering the amount
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            auth_token: authToken,
            delivery_needed: "false",
            amount_cents: amountEGP * 100,
            currency: "EGP",
            merchant_order_id: paymentIntentId,
            items: []
        })
    });
    const orderData = await orderRes.json();
    if (!orderData.id) throw new Error('Paymob order creation failed');
    const orderId = orderData.id;

    // 3. Create payment key
    // For actual production, fetch user details. Using generic here to prevent failure if user misses details.
    const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            auth_token: authToken,
            amount_cents: amountEGP * 100,
            expiration: 3600,
            order_id: orderId,
            billing_data: {
                apartment: "NA", email: (req as any).user.email || "user@creatorengine.com", floor: "NA", first_name: (req as any).user.name || "Founder",
                street: "NA", building: "NA", phone_number: "+201234567890",
                shipping_method: "NA", postal_code: "NA", city: "Cairo",
                country: "EG", last_name: "NA", state: "NA"
            },
            currency: "EGP",
            integration_id: PAYMOB_INTEGRATION_ID,
            lock_order_when_paid: "false"
        })
    });
    const paymentKeyData = await paymentKeyRes.json();
    if (!paymentKeyData.token) throw new Error('Paymob payment key creation failed');
    const paymentToken = paymentKeyData.token;

    // 4. Return iframe URL
    const checkoutUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

    return res.status(200).json({ checkoutUrl, paymentIntentId });
  } catch (err: any) {
    console.error('Payment create error:', err);
    return res.status(500).json({ error: err.message });
  }
});



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
            let pack;
            try {
                pack = await CreditPackModel.findOne({ slug: tx.metadata.packId });
                if (!pack) pack = await CreditPackModel.findById(tx.metadata.packId);
            } catch(e) {}
            
            if (pack) {
                const wallet = await CreditWalletModel.findOne({ userId: tx.userId });
                if (wallet) {
                    wallet.availableCredits += pack.credits;
                    wallet.totalPurchasedCredits += pack.credits;
                    await wallet.save();
                }
            }
        } else if (tx.metadata && tx.metadata.planId) {
            let plan;
            try {
                plan = await SubscriptionPlanModel.findOne({ slug: tx.metadata.planId });
                if (!plan) plan = await SubscriptionPlanModel.findById(tx.metadata.planId);
            } catch(e) {}
            
            if (plan) {
                // Update or create subscription
                const now = new Date();
                const nextMonth = new Date();
                nextMonth.setMonth(now.getMonth() + 1);
                
                await UserSubscriptionModel.findOneAndUpdate(
                    { userId: tx.userId },
                    { 
                        planId: plan.slug,
                        status: 'active',
                        startsAt: now,
                        expiresAt: nextMonth,
                        autoRenew: true
                    },
                    { upsert: true, new: true }
                );
                
                // Add credits to wallet
                const wallet = await CreditWalletModel.findOne({ userId: tx.userId });
                if (wallet) {
                    wallet.availableCredits += plan.monthlyCredits;
                    wallet.totalPurchasedCredits += plan.monthlyCredits;
                    await wallet.save();
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

router.post('/paymob/webhook', async (req: Request, res: Response): Promise<any> => {
  try {
    const { obj, hmac: queryHmac } = req.query as any;
    const hmacParam = queryHmac || req.body.hmac;

    if (!DEMO_MODE && PAYMOB_HMAC && hmacParam) {
        // HMAC Verification
        const { amount_cents, created_at, currency, error_occured, has_parent_transaction, id, integration_id, is_3d_secure, is_auth, is_capture, is_refunded, is_standalone_payment, is_voided, order, owner, pending, source_data, success } = req.body.obj;
        
        // Paymob specific order of concat for HMAC
        const lexoString = [
            amount_cents, created_at, currency, error_occured, has_parent_transaction, id, integration_id, is_3d_secure, is_auth, is_capture, is_refunded, is_standalone_payment, is_voided, order.id, owner, pending, source_data.pan, source_data.sub_type, source_data.type, success
        ].join('');

        const hashed = crypto.createHmac('sha512', PAYMOB_HMAC).update(lexoString).digest('hex');
        
        if (hashed !== hmacParam) {
            console.error('HMAC validation failed');
            return res.status(401).json({ error: 'Unauthorized payload' });
        }
    }

    if (!req.body.obj || !req.body.obj.order) {
        return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    const paymentIntentId = req.body.obj.order.merchant_order_id;
    const success = req.body.obj.success;

    const tx = await PaymentTransactionModel.findOne({ paymentIntentId });
    if (!tx) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    if (tx.status === 'paid') {
        return res.status(200).json({ message: 'Already processed' });
    }

    if (success) {
        tx.status = 'paid';
        tx.transactionId = String(req.body.obj.id);
        await tx.save();

        const { type, planId, packId } = tx.metadata;

        if (type === 'subscription' && planId) {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await UserSubscriptionModel.findOneAndUpdate(
                { userId: tx.userId },
                {
                    planId,
                    status: 'active',
                    startsAt: new Date(),
                    expiresAt,
                    autoRenew: true
                },
                { upsert: true }
            );

            let plan;
            try { plan = await SubscriptionPlanModel.findOne({ slug: planId }); if (!plan) plan = await SubscriptionPlanModel.findById(planId); } catch(e) {}
            if (plan) {
                await addCredits(tx.userId, plan.monthlyCredits, 'subscription', paymentIntentId);
            }
        } else if (type === 'credit_pack' && packId) {
            let pack;
            try { pack = await CreditPackModel.findOne({ slug: packId }); if (!pack) pack = await CreditPackModel.findById(packId); } catch(e) {}
            if (pack) {
                await addCredits(tx.userId, pack.credits, 'topup', paymentIntentId);
            }
        }

        return res.status(200).json({ message: 'Payment processed successfully' });
    } else {
        tx.status = 'failed';
        await tx.save();
        return res.status(200).json({ message: 'Payment recorded as failed' });
    }
  } catch (err: any) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
