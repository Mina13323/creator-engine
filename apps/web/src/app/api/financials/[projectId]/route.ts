import { NextRequest, NextResponse } from 'next/server';
import { connectDB, FinancialForecast, PricingStrategy } from '@creator/database';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
    }
    await connectDB(process.env.DATABASE_URL);
    const { projectId } = await params;

    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      return NextResponse.json({ error: "Invalid operational key provided." }, { status: 400 });
    }

    // Parallel Query Fetch Execution maximizes serverless response times
    const [forecastData, pricingData] = await Promise.all([
      FinancialForecast.findOne({ projectId }).lean(),
      PricingStrategy.findOne({ projectId }).lean()
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
