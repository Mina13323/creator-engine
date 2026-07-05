require('dotenv').config({path: '.env'});
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('business_plans').deleteMany({ userId: 'usr_1783256544608' });
  await db.collection('venture_states').updateOne({ userId: 'usr_1783256544608' }, { $unset: { latestBusinessPlan: '' } });
  await db.collection('credit_wallets').updateOne({ userId: 'usr_1783256544608' }, { $inc: { availableCredits: 15, totalUsedCredits: -15 } });
  console.log('Cleaned up corrupted BP and refunded 15 credits');
  process.exit(0);
});
