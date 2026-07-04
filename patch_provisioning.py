import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\services\creditEngine.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

provision_func = """
import { SubscriptionPlanModel, UserSubscriptionModel } from '@creator/database';

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
"""

if "provisionUserMonetization" not in content:
    content = content.replace("import { CreditWalletModel, CreditTransactionModel } from '@creator/database';", 
                              "import { CreditWalletModel, CreditTransactionModel, SubscriptionPlanModel, UserSubscriptionModel } from '@creator/database';")
    content += "\n" + provision_func.replace("import { SubscriptionPlanModel, UserSubscriptionModel } from '@creator/database';\n", "")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added provisionUserMonetization to creditEngine.ts")
