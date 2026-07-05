import { CreditWalletModel, CreditTransactionModel, SubscriptionPlanModel, UserSubscriptionModel } from '@creator/database';

// PHASE 2 — Credit Cost Matrix
export const CREDIT_COSTS = {
  FOUNDER_ANALYSIS: 10,
  OPPORTUNITY_DISCOVERY: 15,
  BUSINESS_PLAN: 30,
  FINANCIAL_ENGINE: 25,
  BRANDING: 25,
  MARKETING: 25,
  PITCH_DECK: 40,
  ROADMAP_GENERATION: 20,
  AI_CHAT_MESSAGE: 1,
  RAG_QUERY: 2,
  IMAGE_GENERATION: 10,
} as const;

import mongoose from 'mongoose';

export async function getUserCredits(userId: string) {
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
  const wallet = await CreditWalletModel.findOneAndUpdate(
    { userId, availableCredits: { $gte: amount } },
    {
      $inc: {
        availableCredits: -amount,
        totalUsedCredits: amount
      }
    },
    { new: true }
  );

  if (!wallet) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

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
    const freePlan = await SubscriptionPlanModel.findOneAndUpdate(
      { slug: 'free' },
      {
        name: 'Free',
        slug: 'free',
        monthlyPriceEGP: 0,
        monthlyCredits: 100,
        maxProjects: 1,
        features: ['Core venture building workflow'],
        isActive: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
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
