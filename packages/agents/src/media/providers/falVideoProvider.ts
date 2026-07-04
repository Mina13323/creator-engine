import { VideoProvider, VideoProviderInput, VideoProviderOutput } from '../types';
import { uploadUrlToStorage } from '../storageProvider';

export class FalVideoProvider implements VideoProvider {
  async generateVideo(input: VideoProviderInput): Promise<VideoProviderOutput> {
    const apiKey = process.env.FAL_API_KEY;
    if (!apiKey) {
      throw new Error('Configuration Error: FAL_API_KEY is not set. Cannot use fal video provider.');
    }
    
    const payload = {
      image_url: input.images?.[0] || undefined,
      prompt: input.prompt,
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

    const secureUrl = await uploadUrlToStorage(videoUrl, 'video');

    return {
      url: secureUrl,
      provider: 'fal',
      duration: input.duration
    };
  }
}
