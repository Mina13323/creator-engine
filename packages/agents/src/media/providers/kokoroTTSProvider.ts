import { TTSProvider, TTSProviderInput, TTSProviderOutput } from '../types';
import { uploadBufferToStorage } from '../storageProvider';

export class KokoroTTSProvider implements TTSProvider {
  async generateVoiceover(input: TTSProviderInput): Promise<TTSProviderOutput> {
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      throw new Error('Configuration Error: HF_TOKEN is not set for Kokoro TTS.');
    }

    const model = 'hexgrad/Kokoro-82M';
    const url = `https://api-inference.huggingface.co/models/${model}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: input.script })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kokoro TTS inference failed: ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const secureUrl = await uploadBufferToStorage(buffer, 'auto');

    return {
      url: secureUrl,
      provider: 'kokoro'
    };
  }
}
