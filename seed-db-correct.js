const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    monthlyPriceEGP: Number,
    monthlyCredits: Number,
    maxProjects: Number,
    features: [String],
    isActive: { type: Boolean, default: true }
}, { collection: 'subscription_plans' });

const CreditPackSchema = new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    priceEGP: Number,
    credits: Number,
    isActive: { type: Boolean, default: true }
}, { collection: 'credit_packs' });

const SubscriptionPlanModel2 = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
const CreditPackModel2 = mongoose.models.CreditPack || mongoose.model('CreditPack', CreditPackSchema);

async function seed() {
  const url = process.env.DATABASE_URL || "mongodb://menawaelmagdy_db_user:minawaelmagdy@ac-ewbnhwg-shard-00-00.2krql9o.mongodb.net:27017,ac-ewbnhwg-shard-00-01.2krql9o.mongodb.net:27017,ac-ewbnhwg-shard-00-02.2krql9o.mongodb.net:27017/creator_engine?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=creator-engine";
  await mongoose.connect(url);
  
  const plans = [
      { name: 'Free', slug: 'free', monthlyPriceEGP: 0, monthlyCredits: 100, maxProjects: 1, features: ['Basic Features'] },
      { name: 'Starter', slug: 'starter', monthlyPriceEGP: 499, monthlyCredits: 1000, maxProjects: 3, features: ['Advanced Features'] },
      { name: 'Pro', slug: 'pro', monthlyPriceEGP: 999, monthlyCredits: 5000, maxProjects: 10, features: ['Pro Features'] },
      { name: 'Agency', slug: 'agency', monthlyPriceEGP: 2999, monthlyCredits: 20000, maxProjects: 999, features: ['All Features', 'Priority Support'] },
  ];

  const packs = [
      { name: 'Starter Pack', slug: 'starter_pack', priceEGP: 199, credits: 500 },
      { name: 'Pro Pack', slug: 'pro_pack', priceEGP: 799, credits: 2500 },
      { name: 'Enterprise Pack', slug: 'enterprise_pack', priceEGP: 1999, credits: 10000 },
  ];

  for (const p of plans) {
      await SubscriptionPlanModel2.findOneAndUpdate({ slug: p.slug }, p, { upsert: true });
  }

  for (const p of packs) {
      await CreditPackModel2.findOneAndUpdate({ slug: p.slug }, p, { upsert: true });
  }

  console.log("Seeded successfully in correct collections");
  process.exit(0);
}
seed();
