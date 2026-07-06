const mongoose = require('mongoose');

async function test() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL env var is required'); process.exit(1); }
  await mongoose.connect(url);
  
  const packs = await mongoose.connection.collection('credit_packs').find().toArray();
  console.log('Credit Packs:', packs);
  
  const plans = await mongoose.connection.collection('subscription_plans').find().toArray();
  console.log('Subscription Plans:', plans);
  
  process.exit(0);
}
test();
