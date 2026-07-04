import mongoose from 'mongoose';
import { CreditWalletModel } from '../packages/database/src';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log('Connected to DB');
    
    const result = await CreditWalletModel.updateMany(
      {}, 
      { $inc: { availableCredits: 5000, totalPurchasedCredits: 5000 } }
    );
    
    console.log(`Successfully topped up credits for ${result.modifiedCount} wallets!`);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
