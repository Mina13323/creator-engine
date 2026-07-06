const mongoose = require('mongoose');

async function test() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL env var is required'); process.exit(1); }
  await mongoose.connect(url);
  
  const packs = await mongoose.connection.collection('creditpacks').find().toArray();
  console.log('Packs:', packs);
  
  const plans = await mongoose.connection.collection('subscriptionplans').find().toArray();
  console.log('Plans:', plans);
  
  process.exit(0);
}
test();
