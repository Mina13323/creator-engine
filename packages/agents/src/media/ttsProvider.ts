import { TTSProvider, TTSProviderOutput } from './types';
import { KokoroTTSProvider } from './providers/kokoroTTSProvider';
import { ElevenLabsTTSProvider } from './providers/elevenLabsTTSProvider';

export class TTSProviderFactory {
  static getProvider(): TTSProvider {
    const providerName = process.env.TTS_PROVIDER || 'kokoro';

    if (providerName === 'elevenlabs') {
      return new ElevenLabsTTSProvider();
    }
    
    // Default fallback to kokoro
    return new KokoroTTSProvider();
  }
}

export async function generateVoiceover(script: string): Promise<string> {
  const provider = TTSProviderFactory.getProvider();
  const result = await provider.generateVoiceover({ script });
  return result.url;
}
