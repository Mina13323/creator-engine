import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\routes\payments.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

endpoints = """
import { SubscriptionPlanModel, CreditPackModel } from '@creator/database';

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

"""

if "/plans" not in content:
    content = content.replace("const router = express.Router();", "const router = express.Router();\n" + endpoints)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched payments.ts")
