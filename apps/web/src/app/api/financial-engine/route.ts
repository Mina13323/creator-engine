import { NextResponse } from 'next/server';
import { connectDB, FinancialForecast, PricingStrategy } from '@creator/database';

export async function POST(req: Request) {
  try {
    const { projectId, businessIdea, businessModel } = await req.json();

    if (!businessIdea) {
      return NextResponse.json({ error: 'Business Idea is required' }, { status: 400 });
    }

    let resultData;

    // In a real environment, this calls the n8n webhook which processes the RAG & Gemini nodes
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://anger-favorably-unburned.ngrok-free.dev/webhook/financial-engine';

      console.info('[FinancialEngine] Calling webhook:', n8nWebhookUrl);
      let n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'CreatorEngine/1.0'
        },
        body: JSON.stringify({ projectId, businessIdea, businessModel }),
        signal: AbortSignal.timeout(30000),
      });

      if (!n8nResponse.ok) {
        // If it returned 404, n8n might not be active and is waiting for a test execution via /webhook-test/
        if (n8nResponse.status === 404) {
          const testWebhookUrl = n8nWebhookUrl.replace('/webhook/', '/webhook-test/');
          console.info('[FinancialEngine] Webhook returned 404. Retrying with test webhook:', testWebhookUrl);
          n8nResponse = await fetch(testWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
              'User-Agent': 'CreatorEngine/1.0'
            },
            body: JSON.stringify({ projectId, businessIdea, businessModel }),
            signal: AbortSignal.timeout(30000),
          });
        }
      }

      if (!n8nResponse.ok) {
        const errBody = await n8nResponse.text().catch(() => '');
        throw new Error(`Webhook returned status ${n8nResponse.status}: ${errBody.slice(0, 300)}`);
      }

      resultData = await n8nResponse.json();
    } catch (n8nError) {
      console.error('n8n Webhook connection failed.', n8nError);
      return NextResponse.json({ error: 'Financial Engine service unavailable. Please check n8n integration.' }, { status: 503 });
    }

    // Persist to MongoDB if a valid projectId is provided
    if (projectId && projectId !== 'demo-project') {
      try {
        await connectDB(process.env.MONGODB_URI || '');

        const financialInput = resultData.financial;
        const pricingInput = resultData.pricing;

        if (financialInput) {
          const updateData = {
            projectId,
            startupCosts: financialInput.startupCosts,
            monthlyCosts: financialInput.monthlyCosts,
            revenueProjections: financialInput.revenueProjections,
            breakEvenMonth: financialInput.breakEvenMonth,
            currency: financialInput.currency || 'EGP',
            assumptionsApplied: financialInput.assumptionsApplied
          };

          let forecastDoc = await FinancialForecast.findOne({ projectId });
          if (!forecastDoc) {
            forecastDoc = new FinancialForecast(updateData);
          } else {
            forecastDoc.startupCosts = updateData.startupCosts || forecastDoc.startupCosts;
            forecastDoc.monthlyCosts = updateData.monthlyCosts || forecastDoc.monthlyCosts;
            forecastDoc.revenueProjections = updateData.revenueProjections || forecastDoc.revenueProjections;
            forecastDoc.breakEvenMonth = updateData.breakEvenMonth !== undefined ? updateData.breakEvenMonth : forecastDoc.breakEvenMonth;
            forecastDoc.currency = updateData.currency || forecastDoc.currency;
            forecastDoc.assumptionsApplied = updateData.assumptionsApplied || forecastDoc.assumptionsApplied;
          }
          await forecastDoc.save();
        }

        if (pricingInput) {
          const updateData = {
            projectId,
            businessModel: businessModel || pricingInput.businessModel || 'SaaS',
            recommendedStrategyType: pricingInput.recommendedStrategyType,
            currency: pricingInput.currency || 'EGP',
            priceTiers: pricingInput.priceTiers,
            marketPositioningRationale: pricingInput.marketPositioningRationale
          };

          let pricingDoc = await PricingStrategy.findOne({ projectId });
          if (!pricingDoc) {
            pricingDoc = new PricingStrategy(updateData);
          } else {
            pricingDoc.businessModel = updateData.businessModel || pricingDoc.businessModel;
            pricingDoc.recommendedStrategyType = updateData.recommendedStrategyType || pricingDoc.recommendedStrategyType;
            pricingDoc.currency = updateData.currency || pricingDoc.currency;
            pricingDoc.priceTiers = updateData.priceTiers || pricingDoc.priceTiers;
            pricingDoc.marketPositioningRationale = updateData.marketPositioningRationale || pricingDoc.marketPositioningRationale;
          }
          await pricingDoc.save();
        }
      } catch (dbError) {
        console.error('Failed to automatically persist financials to MongoDB:', dbError);
      }
    }

    return NextResponse.json(resultData);

  } catch (error) {
    console.error('Error in financial engine API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
