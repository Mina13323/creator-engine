const mongoose = require('mongoose');

async function test() {
  const url = process.env.DATABASE_URL || "mongodb://menawaelmagdy_db_user:minawaelmagdy@ac-ewbnhwg-shard-00-00.2krql9o.mongodb.net:27017,ac-ewbnhwg-shard-00-01.2krql9o.mongodb.net:27017,ac-ewbnhwg-shard-00-02.2krql9o.mongodb.net:27017/creator_engine?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=creator-engine";
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
