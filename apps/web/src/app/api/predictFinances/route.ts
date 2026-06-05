import { NextRequest, NextResponse } from 'next/server';
import { connectDB, FinancialForecast, PricingStrategy } from '@creator/database';
import { z } from 'zod';
import { generateFinancialPrediction } from '@creator/rag-core'; 

const PredictPayloadSchema = z.object({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  businessIdea: z.string().min(10),
  businessModel: z.enum(['SaaS', 'Agency retainer', 'E-commerce', 'Freelance']),
  currency: z.enum(['EGP', 'USD']).default('EGP'),
  marketConstraints: z.record(z.string(), z.any()).optional()
});

export async function POST(req: NextRequest) {
  try {
    await connectDB(process.env.MONGODB_URI || '');
    const rawBody = await req.json();
    const parsedBody = PredictPayloadSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json({ error: "Validation Fault", details: parsedBody.error.format() }, { status: 400 });
    }

    const { projectId, businessIdea, businessModel, currency } = parsedBody.data;
    
    const { financial, pricing } = await generateFinancialPrediction(businessIdea, businessModel, currency);

    const forecastPromise = FinancialForecast.findOneAndUpdate(
      { projectId },
      {
        projectId,
        startupCosts: financial.startupCosts,
        monthlyCosts: financial.monthlyCosts,
        revenueProjections: financial.revenueProjections,
        breakEvenMonth: financial.breakEvenMonth,
        currency,
        assumptionsApplied: financial.assumptionsApplied
      },
      { upsert: true, new: true, runValidators: true }
    );

    const pricingPromise = PricingStrategy.findOneAndUpdate(
      { projectId },
      {
        projectId,
        businessModel,
        recommendedStrategyType: pricing.recommendedStrategyType,
        currency,
        priceTiers: pricing.priceTiers,
        marketPositioningRationale: pricing.marketPositioningRationale
      },
      { upsert: true, new: true, runValidators: true }
    );

    await Promise.all([forecastPromise, pricingPromise]);

    return NextResponse.json({ success: true, message: "Financial structural strategy generated successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Computing Engine Failure", details: err.message }, { status: 500 });
  }
}