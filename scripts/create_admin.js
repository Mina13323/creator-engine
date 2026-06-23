const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
let envPath = './apps/api/.env';
if (!fs.existsSync(envPath)) {
  envPath = './.env';
}
require('dotenv').config({ path: envPath });

async function createAdmin() {
  const url = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/creator-engine';
  console.log('Connecting to MongoDB at:', url);
  try {
    await mongoose.connect(url);
    console.log('Connected to MongoDB');

    const email = 'admin@example.com';
    const password = 'Password123';
    const name = 'Admin User';

    // Access collection directly to avoid registration schemas/models mismatch
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const existing = await usersCollection.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = existing ? existing.id : `usr_${Date.now()}`;

    const userDoc = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      updatedAt: new Date()
    };

    if (existing) {
      await usersCollection.updateOne({ email }, { $set: userDoc });
      console.log('Existing user updated to admin:', email);
    } else {
      userDoc.createdAt = new Date();
      await usersCollection.insertOne(userDoc);
      console.log('New admin user created:', email);
    }

    console.log('Password set to:', password);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
