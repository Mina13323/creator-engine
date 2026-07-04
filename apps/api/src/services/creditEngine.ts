import { CreditWalletModel, CreditTransactionModel, SubscriptionPlanModel, UserSubscriptionModel, UserModel } from '@creator/database';

// PHASE 2 — Credit Cost Matrix
export const CREDIT_COSTS = {
  FOUNDER_ANALYSIS: 10,
  OPPORTUNITY_DISCOVERY: 15,
  BUSINESS_PLAN: 30,
  FINANCIAL_ENGINE: 25,
  BRANDING: 25,
  MARKETING: 25,
  PITCH_DECK: 40,
  AI_CHAT_MESSAGE: 1,
  RAG_QUERY: 2,
  IMAGE_GENERATION: 10,
} as const;

import mongoose from 'mongoose';

export async function getUserCredits(userId: string) {
  if (process.env.DEMO_MODE === 'true') {
    return { availableCredits: 999999, totalUsedCredits: 0, totalPurchasedCredits: 999999 };
  }

  try {
    const user = await UserModel.findOne({ id: userId });
    if (user && user.role === 'admin') {
      return { availableCredits: 999999, totalUsedCredits: 0, totalPurchasedCredits: 999999 };
    }
  } catch (err) {
    console.error('Error checking user role in getUserCredits:', err);
  }
  
  let wallet = await CreditWalletModel.findOne({ userId });
  if (!wallet) {
    wallet = new CreditWalletModel({
      userId,
      availableCredits: 100,
      totalUsedCredits: 0,
      totalPurchasedCredits: 100
    });
    await wallet.save();
  }
  return wallet;
}

export async function addCredits(userId: string, amount: number, type: 'subscription' | 'topup' | 'refund', referenceId: string = '') {
  if (process.env.DEMO_MODE === 'true') return true;

  const wallet = await CreditWalletModel.findOneAndUpdate(
    { userId },
    { 
      $inc: { 
        availableCredits: amount,
        totalPurchasedCredits: type !== 'refund' ? amount : 0
      } 
    },
    { new: true, upsert: true }
  );

  const tx = new CreditTransactionModel({
    userId,
    type,
    amount,
    feature: 'ADD_CREDITS',
    referenceId
  });
  await tx.save();

  return wallet;
}

export async function deductCredits(userId: string, amount: number, feature: string) {
  if (process.env.DEMO_MODE === 'true') return true;

  try {
    const user = await UserModel.findOne({ id: userId });
    if (user && user.role === 'admin') {
      return true;
    }
  } catch (err) {
    console.error('Error checking user role in deductCredits:', err);
  }

  const wallet = await CreditWalletModel.findOne({ userId });
  if (!wallet || wallet.availableCredits < amount) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

  wallet.availableCredits -= amount;
  wallet.totalUsedCredits += amount;
  await wallet.save();

  const tx = new CreditTransactionModel({
    userId,
    type: 'usage',
    amount: -amount,
    feature,
    referenceId: ''
  });
  await tx.save();

  return true;
}

export async function hasEnoughCredits(userId: string, amount: number) {
  if (process.env.DEMO_MODE === 'true') return true;

  try {
    const user = await UserModel.findOne({ id: userId });
    if (user && user.role === 'admin') {
      return true;
    }
  } catch (err) {
    console.error('Error checking user role in hasEnoughCredits:', err);
  }

  const wallet = await getUserCredits(userId);
  return wallet && wallet.availableCredits >= amount;
}



export async function provisionUserMonetization(userId: string) {
  // 1. Provision Wallet
  let wallet = await CreditWalletModel.findOne({ userId });
  if (!wallet) {
    wallet = new CreditWalletModel({
      userId,
      availableCredits: 100,
      totalUsedCredits: 0,
      totalPurchasedCredits: 100
    });
    await wallet.save();
  }

  // 2. Provision Free Subscription
  let sub = await UserSubscriptionModel.findOne({ userId, status: 'active' });
  if (!sub) {
    const freePlan = await SubscriptionPlanModel.findOne({ slug: 'free' });
    if (freePlan) {
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 10); // Free plan lasts "forever"
      sub = new UserSubscriptionModel({
        userId,
        planId: freePlan._id.toString(),
        status: 'active',
        startsAt: now,
        expiresAt: expiresAt,
        autoRenew: true
      });
      await sub.save();
    }
  }
}
