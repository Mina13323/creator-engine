import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.FIREWORKS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Fireworks API key not configured' }, { status: 500 });
    }

    const cleanPrompt = prompt.replace(/\n/g, ' ').trim();

    const response = await fetch(
      'https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell-fp8/text_to_image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: cleanPrompt,
          aspect_ratio: '1:1',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-image] Fireworks API error raw response:', errorText);
      return NextResponse.json(
        { error: `Fireworks Engine rejected request: ${response.statusText}` },
        { status: response.status }
      );
    }

    // 🚀 FIX: Read the response stream as binary array buffer instead of text JSON
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert the raw image buffer data directly into a Base64 string
    const base64Image = buffer.toString('base64');

    // Create the data URL representation so your <img> tags display it natively
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({
      url: imageUrl,
      id: 'flux-' + Date.now(),
    });
  } catch (err: any) {
    console.error('[generate-image] Unexpected server error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}