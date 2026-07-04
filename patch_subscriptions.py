import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\routes\payments.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure SubscriptionPlanModel and UserSubscriptionModel are imported
if 'SubscriptionPlanModel' not in content:
    content = content.replace('CreditPackModel', 'CreditPackModel, SubscriptionPlanModel, UserSubscriptionModel')

# We need to replace the packId handling logic with logic for both packId and planId.
# We will do this by using a regex to replace the logic inside `if (success === 'true' || success === true) {` 

def replace_logic(match):
    return """if (success === 'true' || success === true) {
        tx.status = 'paid';
        await tx.save();

        if (tx.metadata && tx.metadata.packId) {
            let pack;
            try {
                pack = await CreditPackModel.findOne({ slug: tx.metadata.packId });
                if (!pack) pack = await CreditPackModel.findById(tx.metadata.packId);
            } catch(e) {}
            
            if (pack) {
                const wallet = await CreditWalletModel.findOne({ userId: tx.userId });
                if (wallet) {
                    wallet.availableCredits += pack.credits;
                    wallet.totalPurchasedCredits += pack.credits;
                    await wallet.save();
                }
            }
        } else if (tx.metadata && tx.metadata.planId) {
            let plan;
            try {
                plan = await SubscriptionPlanModel.findOne({ slug: tx.metadata.planId });
                if (!plan) plan = await SubscriptionPlanModel.findById(tx.metadata.planId);
            } catch(e) {}
            
            if (plan) {
                // Update or create subscription
                const now = new Date();
                const nextMonth = new Date();
                nextMonth.setMonth(now.getMonth() + 1);
                
                await UserSubscriptionModel.findOneAndUpdate(
                    { userId: tx.userId },
                    { 
                        planId: plan.slug,
                        status: 'active',
                        startsAt: now,
                        expiresAt: nextMonth,
                        autoRenew: true
                    },
                    { upsert: true, new: true }
                );
                
                // Add credits to wallet
                const wallet = await CreditWalletModel.findOne({ userId: tx.userId });
                if (wallet) {
                    wallet.availableCredits += plan.monthlyCredits;
                    wallet.totalPurchasedCredits += plan.monthlyCredits;
                    await wallet.save();
                }
            }
        }
        
        return res.status(200).json({ message: 'Processed', wallet: await CreditWalletModel.findOne({ userId: tx.userId }) });
"""

# Replace in verify-redirect
pattern = re.compile(r"if \(success === 'true' \|\| success === true\) \{[\s\S]*?return res\.status\(200\)\.json\(\{ message: 'Processed',?.*\}\);", re.MULTILINE)
content = pattern.sub(replace_logic, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated payments.ts")
