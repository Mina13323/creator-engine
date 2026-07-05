import { TTSProvider, TTSProviderOutput } from './types';
import { SpeechT5TTSProvider } from './providers/speechT5TTSProvider';
import { ElevenLabsTTSProvider } from './providers/elevenLabsTTSProvider';

export class TTSProviderFactory {
  static getProvider(): TTSProvider {
    const providerName = process.env.TTS_PROVIDER || 'speecht5';

    if (providerName === 'elevenlabs') {
      return new ElevenLabsTTSProvider();
    }

    // Default fallback to speecht5
    return new SpeechT5TTSProvider();
  }
}

export async function generateVoiceover(script: string): Promise<string> {
  const provider = TTSProviderFactory.getProvider();
  const result = await provider.generateVoiceover({ script });
  return result.url;
}
