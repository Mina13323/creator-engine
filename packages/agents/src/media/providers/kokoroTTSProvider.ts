import { TTSProvider, TTSProviderInput, TTSProviderOutput } from '../types';
import { uploadBufferToStorage } from '../storageProvider';

export class KokoroTTSProvider implements TTSProvider {
  async generateVoiceover(input: TTSProviderInput): Promise<TTSProviderOutput> {
    const provider = process.env.TTS_PROVIDER || 'hf';
    let url = '';
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body = '';

    if (provider === 'fireworks') {
      const apiKey = process.env.FIREWORKS_API_KEY;
      if (!apiKey) throw new Error('Configuration Error: FIREWORKS_API_KEY is not set for Kokoro TTS.');
      url = 'https://api.fireworks.ai/inference/v1/audio/speech';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = JSON.stringify({
        model: 'accounts/fireworks/models/kokoro-82m',
        input: input.script,
        voice: 'alloy'
      });
    } else {
      const hfToken = process.env.HF_TOKEN;
      if (!hfToken) throw new Error('Configuration Error: HF_TOKEN is not set for Kokoro TTS.');
      const model = 'hexgrad/Kokoro-82M';
      url = `https://router.huggingface.co/hf-inference/models/${model}`;
      headers['Authorization'] = `Bearer ${hfToken}`;
      body = JSON.stringify({ inputs: input.script });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kokoro TTS inference failed: ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const secureUrl = await uploadBufferToStorage(buffer, 'auto');

    return {
      url: secureUrl, // keep for backward compatibility
      audioUrl: secureUrl,
      provider: 'kokoro',
      duration: 0 // real duration could be parsed if available
    };
  }
}
