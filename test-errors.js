const mongoose = require('mongoose');

async function test() {
  const url = process.env.DATABASE_URL || "mongodb://menawaelmagdy_db_user:minawaelmagdy@ac-ewbnhwg-shard-00-00.2krql9o.mongodb.net:27017,ac-ewbnhwg-shard-00-01.2krql9o.mongodb.net:27017,ac-ewbnhwg-shard-00-02.2krql9o.mongodb.net:27017/creator_engine?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=creator-engine";
  await mongoose.connect(url);
  
  const run = await mongoose.connection.collection('agentruns').find({ workflow: 'financial' }).sort({startedAt: -1}).limit(1).toArray();
  console.log('Latest Run (Any):', run[0]);
  
  process.exit(0);
}
test();
