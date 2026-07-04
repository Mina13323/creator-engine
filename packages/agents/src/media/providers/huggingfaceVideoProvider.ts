import { VideoProvider, VideoProviderInput, VideoProviderOutput } from '../types';
import { uploadBufferToStorage } from '../storageProvider';

export class HuggingFaceVideoProvider implements VideoProvider {
  async generateVideo(input: VideoProviderInput): Promise<VideoProviderOutput> {
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      throw new Error('Configuration Error: HF_TOKEN is not set.');
    }

    // Default to Wan-AI/Wan2.1-T2V-1.3B, fallback to Damovilab
    const model = process.env.HF_VIDEO_MODEL || 'Wan-AI/Wan2.1-T2V-1.3B';
    const url = `https://router.huggingface.co/hf-inference/models/${model}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      // Note: most text-to-video HF endpoints take { inputs: "..." }
      body: JSON.stringify({ inputs: input.prompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face inference failed for ${model}: ${errorText}`);
    }

    // Hugging Face typically returns raw binary video for T2V tasks
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the raw video buffer to Cloudinary
    const secureUrl = await uploadBufferToStorage(buffer, 'video');

    return {
      url: secureUrl,
      provider: 'huggingface',
      duration: input.duration
    };
  }
}
