const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET || 'CreatorEngineSecretKey';

async function testReport() {
  if (!dbUrl) {
    console.error('Error: DATABASE_URL is not configured in .env');
    process.exit(1);
  }

  console.info('Connecting to MongoDB...');
  await mongoose.connect(dbUrl);

  const UserModel = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

  // Find an admin user to generate a token
  const adminUser = await UserModel.findOne({ role: 'admin' }).lean();
  if (!adminUser) {
    console.error('Error: No admin user found in database.');
    process.exit(1);
  }

  console.info(`Authenticating as Admin: ${adminUser.name} (${adminUser.email})`);

  // Generate JWT token
  const token = jwt.sign(
    { id: adminUser.id, email: adminUser.email },
    jwtSecret,
    { expiresIn: '1h' }
  );

  const url = 'http://localhost:5000/api/portal/reports/generate';
  console.info(`Requesting: ${url}`);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Error: Request failed with status ${res.status}: ${errText}`);
      process.exit(1);
    }

    const data = await res.json();
    console.info('\n--- Weekly System Report Data ---');
    console.info(JSON.stringify(data, null, 2));
    console.info('\nSuccess! Secure endpoint responded successfully.');
  } catch (err) {
    console.error(`Error: Fetch failed. Make sure your API server is running on port 5000: ${err.message}`);
  }

  await mongoose.disconnect();
}

testReport();
