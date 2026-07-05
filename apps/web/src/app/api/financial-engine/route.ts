import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { projectId, businessIdea, businessModel } = await req.json();

    if (!businessIdea) {
      return NextResponse.json({ error: 'Business Idea is required' }, { status: 400 });
    }

    let resultData;

    // Call the native agent directly in-code (processes vector search and prompts the LLM natively)
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      if (!n8nWebhookUrl) {
        return NextResponse.json({ error: 'Financial Engine service is not configured.' }, { status: 503 });
      }

      console.info('[FinancialEngine] Calling webhook:', n8nWebhookUrl);
      let n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CreatorEngine/1.0'
        },
        body: JSON.stringify({ projectId, businessIdea, businessModel }),
        signal: AbortSignal.timeout(30000),
      });

      if (!n8nResponse.ok) {
        const errBody = await n8nResponse.text().catch(() => '');
        throw new Error(`Webhook returned status ${n8nResponse.status}: ${errBody.slice(0, 300)}`);
      }

      resultData = await n8nResponse.json();
    } catch (n8nError) {
      console.error('n8n Webhook connection failed.', n8nError);
      return NextResponse.json({ error: 'Financial Engine service unavailable. Please check n8n integration.' }, { status: 503 });
    }

    return NextResponse.json(resultData);

  } catch (error) {
    console.error('Error in financial engine API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
