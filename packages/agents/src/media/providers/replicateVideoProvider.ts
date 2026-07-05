import Replicate from 'replicate';
import { VideoProvider, VideoProviderInput, VideoProviderOutput } from '../types';
import { uploadUrlToStorage } from '../storageProvider';

export class ReplicateVideoProvider implements VideoProvider {
  async generateVideo(input: VideoProviderInput): Promise<VideoProviderOutput> {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new Error('REPLICATE_API_TOKEN is not configured.');
    }

    const replicate = new Replicate({
      auth: apiToken,
    });

    // Use a motion prompt from scenes or fallback to main prompt
    const motionPrompt = input.scenes?.[0]?.motionPrompt || input.prompt || "cinematic commercial motion";
    const imageUrl = (input.images && input.images.length > 0) ? input.images[0] : undefined;

    if (!imageUrl) {
      throw new Error('Replicate video generation requires at least one image.');
    }

    try {
      // Using user requested model
      const output = await replicate.run(
        "alibaba/happyhorse-1.0",
        {
          input: {
            prompt: motionPrompt,
            image: imageUrl,
            image_url: imageUrl // fallback in case the API expects image_url instead
          }
        }
      ) as string | string[];

      // Replicate returns a raw video URL or array, we grab it and upload to Cloudinary
      const rawUrl = Array.isArray(output) ? output[0] : output;
      const secureUrl = await uploadUrlToStorage(rawUrl, 'video');

      return {
        url: secureUrl,
        provider: 'replicate',
        generationType: 'AI_VIDEO'
      };
    } catch (e) {
      console.error('Replicate generation error:', e);
      throw e;
    }
  }
}
