import { VideoProvider, VideoProviderInput, VideoProviderOutput } from './types';
import { FalVideoProvider } from './providers/falVideoProvider';
import { HuggingFaceVideoProvider } from './providers/huggingfaceVideoProvider';

export class VideoProviderFactory {
  static getProvider(): VideoProvider {
    const providerName = process.env.VIDEO_PROVIDER || 'huggingface';

    if (providerName === 'fal') {
      return new FalVideoProvider();
    } else if (providerName === 'huggingface') {
      return new HuggingFaceVideoProvider();
    }
    
    // Default fallback to huggingface
    return new HuggingFaceVideoProvider();
  }
}

export async function generateMarketingVideo(input: {
  images: string[];
  script: string;
  duration: number;
  ratio: string;
}): Promise<VideoProviderOutput> {
  const provider = VideoProviderFactory.getProvider();
  
  return provider.generateVideo({
    prompt: input.script,
    images: input.images,
    duration: input.duration,
  });
}
