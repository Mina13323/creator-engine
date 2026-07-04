import { NextRequest, NextResponse } from 'next/server';
import { callHuggingFaceImage } from '@creator/agents';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return NextResponse.json({ error: 'HF_TOKEN not configured' }, { status: 500 });
    }

    const cleanPrompt = prompt.replace(/\n/g, ' ').trim();

    const imageBuffer = await callHuggingFaceImage(cleanPrompt, "1:1");
    if (!imageBuffer) {
      return NextResponse.json(
        { error: `Image Engine rejected request` },
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