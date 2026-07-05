import { TTSProvider, TTSProviderInput, TTSProviderOutput } from '../types';
import { uploadBufferToStorage } from '../storageProvider';

export class ElevenLabsTTSProvider implements TTSProvider {
  async generateVoiceover(input: TTSProviderInput): Promise<TTSProviderOutput> {
    const apiKey = process.env.TTS_API_KEY;
    if (!apiKey) {
      throw new Error('TTS_API_KEY is not configured for ElevenLabs.');
    }

    const url = process.env.TTS_ENDPOINT || 'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: input.script,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`TTS generation failed: ${err}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const permanentUrl = await uploadBufferToStorage(buffer, 'auto');
    
    return {
      url: permanentUrl,
      provider: 'elevenlabs'
    };
  }
}
