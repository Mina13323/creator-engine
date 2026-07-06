const mongoose = require('mongoose');

async function test() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL env var is required'); process.exit(1); }
  await mongoose.connect(url);
  
  const run = await mongoose.connection.collection('agentruns').find({ workflow: 'financial' }).sort({startedAt: -1}).limit(1).toArray();
  console.log('Latest Run (Any):', run[0]);
  
  process.exit(0);
}
test();
