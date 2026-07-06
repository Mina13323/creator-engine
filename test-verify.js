const mongoose = require('mongoose');

async function test() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL env var is required'); process.exit(1); }
  await mongoose.connect(url);
  
  const tx = await mongoose.connection.collection('payment_transactions').find().sort({createdAt: -1}).limit(1).toArray();
  console.log('Latest TX:', tx[0]);
  
  if (tx[0]) {
      const wallet = await mongoose.connection.collection('credit_wallets').findOne({ userId: tx[0].userId });
      console.log('Wallet:', wallet);
  }
  
  process.exit(0);
}
test();
