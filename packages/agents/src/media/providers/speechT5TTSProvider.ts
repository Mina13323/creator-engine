import { TTSProvider, TTSProviderInput, TTSProviderOutput } from '../types';
import { uploadBufferToStorage } from '../storageProvider';

export class SpeechT5TTSProvider implements TTSProvider {
  async generateVoiceover(input: TTSProviderInput): Promise<TTSProviderOutput> {
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) throw new Error('Configuration Error: HF_TOKEN is not set for SpeechT5 TTS.');
    
    const model = 'microsoft/speecht5_tts';
    const url = `https://router.huggingface.co/hf-inference/models/${model}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: input.script })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SpeechT5 TTS inference failed: ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const secureUrl = await uploadBufferToStorage(buffer, 'auto');

    return {
      url: secureUrl,
      audioUrl: secureUrl,
      provider: 'speecht5',
      duration: 0
    };
  }
}
