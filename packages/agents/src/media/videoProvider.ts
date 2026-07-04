import { uploadUrlToStorage } from './storageProvider';

export interface VideoResult {
  videoUrl: string;
  thumbnail?: string;
  provider: string;
}

export interface VideoProvider {
  generateVideo(input: {
    images: string[];
    script: string;
    duration: number;
    ratio: string;
  }): Promise<VideoResult>;
}

export class FalLTXVideoProvider implements VideoProvider {
  async generateVideo(input: {
    images: string[];
    script: string;
    duration: number;
    ratio: string;
  }): Promise<VideoResult> {
    const apiKey = process.env.FAL_API_KEY;
    if (!apiKey) {
      throw new Error('FAL_API_KEY is not set');
    }
    
    // Convert ratio if needed, but fal-ai ltx-video might not take ratio strictly, we just pass the image.
    // LTX video usually expects `image_url` and `prompt`
    const payload = {
      image_url: input.images[0] || undefined,
      prompt: input.script,
    };

    const response = await fetch('https://queue.fal.run/fal-ai/ltx-video', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Fal AI request failed: ${txt}`);
    }
    
    const data = await response.json();
    const statusUrl = data.status_url;
    const responseUrl = data.response_url;

    if (!statusUrl || !responseUrl) {
      throw new Error('Invalid response from Fal AI');
    }

    // Polling
    let isCompleted = false;
    let finalResult = null;
    let attempts = 0;
    while (!isCompleted && attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
      
      const statusRes = await fetch(statusUrl, {
        headers: { 'Authorization': `Key ${apiKey}` }
      });
      const statusData = await statusRes.json();
      
      if (statusData.status === 'COMPLETED') {
        isCompleted = true;
        // Fetch the final response
        const resultRes = await fetch(responseUrl, {
          headers: { 'Authorization': `Key ${apiKey}` }
        });
        finalResult = await resultRes.json();
      } else if (statusData.status === 'FAILED') {
        throw new Error('Fal AI Video generation failed');
      }
    }

    if (!isCompleted || !finalResult) {
      throw new Error('Video generation timed out');
    }

    const videoUrl = finalResult.video?.url;
    if (!videoUrl) {
      throw new Error('No video URL returned from Fal AI');
    }

    // Upload to permanent storage
    const secureUrl = await uploadUrlToStorage(videoUrl, 'video');

    return {
      videoUrl: secureUrl,
      provider: 'fal-ai/ltx-video'
    };
  }
}

export async function generateMarketingVideo(input: {
  images: string[];
  script: string;
  duration: number;
  ratio: string;
}): Promise<VideoResult> {
  const provider = new FalLTXVideoProvider();
  return provider.generateVideo(input);
}
