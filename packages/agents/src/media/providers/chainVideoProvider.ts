import { VideoProvider, VideoProviderInput, VideoProviderOutput } from '../types';
import { ReplicateVideoProvider } from './replicateVideoProvider';
import { HuggingFaceSpaceProvider } from './huggingFaceSpaceProvider';
import { JSON2VideoProvider } from './json2VideoProvider';

export class ChainVideoProvider implements VideoProvider {
  async generateVideo(input: VideoProviderInput): Promise<VideoProviderOutput> {
    
    // 1. Replicate
    try {
      const replicateProvider = new ReplicateVideoProvider();
      return await replicateProvider.generateVideo(input);
    } catch (e: any) {
      const errMsg = e?.message || String(e);
      // Check for payment required, insufficient credit, or rate limit
      if (
        errMsg.includes('402') || 
        errMsg.toLowerCase().includes('payment required') || 
        errMsg.toLowerCase().includes('insufficient credit') || 
        errMsg.includes('429') || 
        errMsg.toLowerCase().includes('rate limit')
      ) {
        console.warn('Replicate unavailable (credits/rate limit) -> switching provider');
      } else {
        console.warn('Replicate error -> switching provider', errMsg);
      }
    }

    // 2. HuggingFace Space
    try {
      if (process.env.HF_TOKEN && process.env.HF_VIDEO_SPACE) {
        const hfProvider = new HuggingFaceSpaceProvider();
        return await hfProvider.generateVideo(input);
      } else {
        console.warn('HuggingFace Space skipping -> not configured');
      }
    } catch (e: any) {
      console.warn('HuggingFace Space error -> switching provider', e?.message || String(e));
    }

    // 3. JSON2Video
    try {
      const json2Video = new JSON2VideoProvider();
      return await json2Video.generateVideo(input);
    } catch (e: any) {
      console.error('JSON2Video fallback also failed', e);
      throw new Error('All video providers failed in chain.');
    }
  }
}
