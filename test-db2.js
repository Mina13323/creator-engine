const mongoose = require('mongoose');

async function test() {
  const url = process.env.DATABASE_URL || "mongodb://menawaelmagdy_db_user:minawaelmagdy@ac-ewbnhwg-shard-00-00.2krql9o.mongodb.net:27017,ac-ewbnhwg-shard-00-01.2krql9o.mongodb.net:27017,ac-ewbnhwg-shard-00-02.2krql9o.mongodb.net:27017/creator_engine?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=creator-engine";
  await mongoose.connect(url);
  
  const packs = await mongoose.connection.collection('credit_packs').find().toArray();
  console.log('Credit Packs:', packs);
  
  const plans = await mongoose.connection.collection('subscription_plans').find().toArray();
  console.log('Subscription Plans:', plans);
  
  process.exit(0);
}
test();
