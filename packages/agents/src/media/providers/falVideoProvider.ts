import { VideoProvider, VideoProviderInput, VideoProviderOutput } from '../types';
import { uploadUrlToStorage } from '../storageProvider';

export class FalVideoProvider implements VideoProvider {
  async generateVideo(input: VideoProviderInput): Promise<VideoProviderOutput> {
    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      throw new Error('FAL_KEY is not configured.');
    }

    const motionPrompt = input.scenes?.[0]?.motionPrompt || input.prompt || "cinematic commercial motion";
    const imageUrl = (input.images && input.images.length > 0) ? input.images[0] : undefined;

    try {
      // Example calling fal.ai for Kling or LTX
      const response = await fetch("https://queue.fal.run/fal-ai/kling-video/v1/standard/image-to-video", {
        method: "POST",
        headers: {
          "Authorization": `Key ${falKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image_url: imageUrl,
          prompt: motionPrompt
        })
      });

      if (!response.ok) {
        throw new Error(`Fal.ai error: ${await response.text()}`);
      }
      
      const data = await response.json();
      const requestId = data.request_id;
      
      let videoUrl = data.video?.url;
      
      if (!videoUrl) {
         throw new Error('Fal.ai returned success but no video URL was found.');
      }

      videoUrl = await uploadUrlToStorage(videoUrl, 'video');

      return {
        url: videoUrl,
        provider: 'fal',
        generationType: 'AI_VIDEO'
      };
    } catch (e) {
      console.error('Fal generation error:', e);
      throw e;
    }
  }
}
