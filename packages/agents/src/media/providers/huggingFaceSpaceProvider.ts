import { Client } from "@gradio/client";
import { VideoProvider, VideoProviderInput, VideoProviderOutput } from '../types';
import { uploadUrlToStorage } from '../storageProvider';

export class HuggingFaceSpaceProvider implements VideoProvider {
  async generateVideo(input: VideoProviderInput): Promise<VideoProviderOutput> {
    const spaceId = process.env.HF_VIDEO_SPACE;
    const token = process.env.HF_TOKEN;

    if (!spaceId) {
      throw new Error('HF_VIDEO_SPACE is not configured.');
    }

    const motionPrompt = input.scenes?.[0]?.motionPrompt || input.prompt || "cinematic commercial motion";
    const imageUrl = (input.images && input.images.length > 0) ? input.images[0] : undefined;

    if (!imageUrl) {
      throw new Error('HuggingFace Space generation requires at least one image.');
    }

    try {
      const client = await Client.connect(spaceId, { hf_token: token } as any);
      
      const result = await client.predict("/generate", {
        image: imageUrl,
        prompt: motionPrompt
      }) as any;

      const rawUrl = result.data?.[0]?.url || result.data?.[0];
      if (!rawUrl) {
        throw new Error('Failed to extract video URL from Gradio output.');
      }

      const secureUrl = await uploadUrlToStorage(rawUrl, 'video');

      return {
        url: secureUrl,
        provider: 'huggingface-space',
        generationType: 'AI_VIDEO'
      };
    } catch (e) {
      console.error('HuggingFace Space generation error:', e);
      throw e;
    }
  }
}
