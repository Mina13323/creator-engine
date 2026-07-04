import { VideoProvider, VideoProviderInput, VideoProviderOutput } from './types';
import { FalVideoProvider } from './providers/falVideoProvider';
import { JSON2VideoProvider } from './providers/json2VideoProvider';
import { ReplicateVideoProvider } from './providers/replicateVideoProvider';
import { HuggingFaceSpaceProvider } from './providers/huggingFaceSpaceProvider';
import { ChainVideoProvider } from './providers/chainVideoProvider';

export class VideoProviderFactory {
  static getProvider(): VideoProvider | null {
    const providerName = process.env.VIDEO_PROVIDER || 'chain';

    if (providerName === 'fal') {
      return new FalVideoProvider();
    } else if (providerName === 'replicate') {
      return new ReplicateVideoProvider();
    } else if (providerName === 'huggingface-space') {
      return new HuggingFaceSpaceProvider();
    } else if (providerName === 'json2video') {
      return new JSON2VideoProvider();
    }
    
    // Automatic Fallback Chain Priority Layer
    return new ChainVideoProvider();
  }
}

export async function generateMarketingVideo(input: {
  images: string[];
  script: string;
  scenes?: any[];
  duration: number;
  ratio: string;
  audioUrl?: string;
}): Promise<VideoProviderOutput | null> {
  const provider = VideoProviderFactory.getProvider();
  
  if (!provider) return null;

  return provider.generateVideo({
    prompt: input.script,
    images: input.images,
    scenes: input.scenes,
    duration: input.duration,
    ratio: input.ratio,
    audioUrl: input.audioUrl,
  });
}
