import express, { Request, Response } from 'express';
import { adminMiddleware, authMiddleware } from '../middleware';
import { PaymentTransactionModel, UserSubscriptionModel } from '@creator/database';
import { addCredits } from '../services/creditEngine';
import crypto from 'crypto';
import { env } from '../env';

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
router.post('/seed', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
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

    if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID) {
      return res.status(503).json({
        error: 'Paymob is not configured. Checkout is unavailable.'
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



// Browser redirect handler — only redirects, does NOT grant credits (webhook handles that)
const FRONTEND_REDIRECT = process.env.FRONTEND_URL || 'http://localhost:3000';
router.get('/paymob/verify-redirect', async (req: Request, res: Response): Promise<any> => {
  try {
    const { merchant_order_id, success } = req.query;
    const successParam = success === 'true' ? 'payment_success=true' : 'payment_error=failed';
    return res.send(`<script>window.top.location.href = "${FRONTEND_REDIRECT}/dashboard?${successParam}&order=${merchant_order_id || ''}";</script>`);
  } catch (err: any) {
    console.error('Verify redirect error:', err);
    return res.send(`<script>window.top.location.href = "${FRONTEND_REDIRECT}/dashboard?payment_error=server_error";</script>`);
  }
});

router.post('/paymob/verify-redirect', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { merchant_order_id } = req.body;
    
    if (!merchant_order_id) return res.status(400).json({ error: 'Missing merchant_order_id' });

    const tx = await PaymentTransactionModel.findOne({ paymentIntentId: merchant_order_id });
    if (!tx) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    // Security: Ensure the transaction belongs to the requesting user
    if (tx.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden: transaction does not belong to you' });
    }

    if (tx.status === 'paid') {
        const wallet = await CreditWalletModel.findOne({ userId });
        return res.status(200).json({ message: 'Already processed', wallet });
    }

    // Server-side verification: query Paymob for actual payment status
    // instead of trusting client-side `success` flag
    let paymentVerified = false;
    if (PAYMOB_API_KEY) {
      try {
        // Authenticate with Paymob
        const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: PAYMOB_API_KEY })
        });
        const authData = await authRes.json();

        if (authData.token) {
          // Query Paymob for the order status by merchant_order_id
          const orderRes = await fetch(
            `https://accept.paymob.com/api/ecommerce/orders?merchant_order_id=${merchant_order_id}`,
            { headers: { 'Authorization': `Bearer ${authData.token}` } }
          );
          const orderData = await orderRes.json();
          // Paymob returns results array; check if any transaction succeeded
          const results = orderData.results || (Array.isArray(orderData) ? orderData : [orderData]);
          for (const order of results) {
            if (order.paid_amount_cents && order.paid_amount_cents > 0) {
              paymentVerified = true;
              break;
            }
          }
        }
      } catch (verifyErr) {
        console.error('Paymob server-side verification failed:', verifyErr);
        // Fall through — do NOT grant credits if verification fails
      }
    }

    // In development mode, auto-verify for testing purposes
    if (env.NODE_ENV === 'development' || process.env.NODE_ENV === 'development') {
      paymentVerified = true;
    }

    if (!paymentVerified) {
      return res.status(402).json({ error: 'Payment not confirmed by provider. Please wait for processing or contact support.', message: 'Payment not confirmed by provider.' });
    }

    // Atomically claim the transaction to prevent double-spending
    const claimedTx = await PaymentTransactionModel.findOneAndUpdate(
      { paymentIntentId: merchant_order_id, status: 'pending' },
      { $set: { status: 'paid' } },
      { new: true }
    );

    if (!claimedTx) {
      return res.status(200).json({ message: 'Already processed' });
    }

    // Grant credits/subscription based on transaction type
    if (claimedTx.metadata && claimedTx.metadata.packId) {
      let pack;
      try {
        pack = await CreditPackModel.findOne({ slug: claimedTx.metadata.packId });
        if (!pack) pack = await CreditPackModel.findById(claimedTx.metadata.packId);
      } catch(e) {}
      if (pack) {
        await addCredits(userId, pack.credits, 'topup', merchant_order_id);
      }
    } else if (claimedTx.metadata && claimedTx.metadata.planId) {
      let plan;
      try {
        plan = await SubscriptionPlanModel.findOne({ slug: claimedTx.metadata.planId });
        if (!plan) plan = await SubscriptionPlanModel.findById(claimedTx.metadata.planId);
      } catch(e) {}
      if (plan) {
        const now = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(now.getMonth() + 1);
        await UserSubscriptionModel.findOneAndUpdate(
          { userId },
          { planId: plan.slug, status: 'active', startsAt: now, expiresAt: nextMonth, autoRenew: true },
          { upsert: true, new: true }
        );
        await addCredits(userId, plan.monthlyCredits, 'subscription', merchant_order_id);
      }
    }
    
    const wallet = await CreditWalletModel.findOne({ userId });
    return res.status(200).json({ message: 'Payment verified and processed', wallet });
  } catch (err: any) {
    console.error('Verify redirect error:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/paymob/webhook', async (req: Request, res: Response): Promise<any> => {
  try {
    const { obj, hmac: queryHmac } = req.query as any;
    const hmacParam = queryHmac || req.body.hmac;

    if (!req.body.obj || !req.body.obj.order) {
        return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    if (PAYMOB_HMAC) {
        // HMAC Verification
        const { amount_cents, created_at, currency, error_occured, has_parent_transaction, id, integration_id, is_3d_secure, is_auth, is_capture, is_refunded, is_standalone_payment, is_voided, order, owner, pending, source_data, success } = req.body.obj;
        
        // Paymob specific order of concat for HMAC
        const lexoString = [
            amount_cents, created_at, currency, error_occured, has_parent_transaction, id, integration_id, is_3d_secure, is_auth, is_capture, is_refunded, is_standalone_payment, is_voided, order.id, owner, pending, source_data.pan, source_data.sub_type, source_data.type, success
        ].join('');

        const hashed = crypto.createHmac('sha512', PAYMOB_HMAC).update(lexoString).digest('hex');
        
        const expected = Buffer.from(hashed, 'hex');
        const received = Buffer.from(String(hmacParam), 'hex');
        if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
            console.error('HMAC validation failed');
            return res.status(401).json({ error: 'Unauthorized payload' });
        }
    } else if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ error: 'Paymob HMAC is not configured' });
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
        const claimedTx = await PaymentTransactionModel.findOneAndUpdate(
          { paymentIntentId, status: 'pending' },
          { $set: { status: 'paid', transactionId: String(req.body.obj.id) } },
          { new: true }
        );

        if (!claimedTx) {
          return res.status(200).json({ message: 'Already processed' });
        }

        const { type, planId, packId } = claimedTx.metadata;

        if (type === 'subscription' && planId) {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await UserSubscriptionModel.findOneAndUpdate(
                { userId: claimedTx.userId },
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
                await addCredits(claimedTx.userId, plan.monthlyCredits, 'subscription', paymentIntentId);
            }
        } else if (type === 'credit_pack' && packId) {
            let pack;
            try { pack = await CreditPackModel.findOne({ slug: packId }); if (!pack) pack = await CreditPackModel.findById(packId); } catch(e) {}
            if (pack) {
                await addCredits(claimedTx.userId, pack.credits, 'topup', paymentIntentId);
            }
        }

        return res.status(200).json({ message: 'Payment processed successfully' });
    } else {
        await PaymentTransactionModel.findOneAndUpdate(
          { paymentIntentId, status: 'pending' },
          { $set: { status: 'failed', transactionId: String(req.body.obj.id) } }
        );
        return res.status(200).json({ message: 'Payment recorded as failed' });
    }
  } catch (err: any) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
