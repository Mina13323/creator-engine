@@ -1,0 +1,36 @@
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { FinancialForecast, PricingStrategy } from '@/models/FinancialPlan';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    await dbConnect();
    const { projectId } = params;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid operational key provided." }, { status: 400 });
    }

    // Parallel Query Fetch Execution maximizes serverless response times
    const [forecastData, pricingData] = await Promise.all([
      FinancialForecast.findOne({ projectId: new mongoose.Types.ObjectId(projectId) }).lean(),
      PricingStrategy.findOne({ projectId: new mongoose.Types.ObjectId(projectId) }).lean()
    ]);

    if (!forecastData && !pricingData) {
      return NextResponse.json({ error: "No financial plans matching requested project identifiers found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        forecast: forecastData || null,
        pricing: pricingData || null
      }
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: "Hydration pipeline failed execution", details: err.message }, { status: 500 });
  }
}