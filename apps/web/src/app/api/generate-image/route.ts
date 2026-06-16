import { NextRequest, NextResponse } from 'next/server';
import { callFireworksImage } from '@creator/agents';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.FIREWORKS_API_KEY_CHAT || process.env.FIREWORKS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Fireworks API key not configured' }, { status: 500 });
    }

    const cleanPrompt = prompt.replace(/\n/g, ' ').trim();

    const imageBuffer = await callFireworksImage(cleanPrompt, "1:1");
    if (!imageBuffer) {
      return NextResponse.json(
        { error: `Fireworks Engine rejected request` },
        { status: 502 }
      );
    }

    // Convert the raw image buffer data directly into a Base64 string
    const base64Image = imageBuffer.toString('base64');

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