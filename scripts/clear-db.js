require('dotenv').config();

const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();

  const db = client.db('creator_engine');

  const collections = await db.listCollections().toArray();

  for (const collection of collections) {
    console.log(`Clearing ${collection.name}...`);
    await db.collection(collection.name).deleteMany({});
  }

  console.log('Database cleared successfully.');
  await client.close();
}

main().catch(console.error);