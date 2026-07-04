import { uploadBufferToStorage } from './storageProvider';

export async function generateVoiceover(script: string): Promise<string> {
  const apiKey = process.env.TTS_API_KEY;
  // If no API key, throw instead of mocking
  if (!apiKey) {
    throw new Error('TTS_API_KEY is not configured');
  }

  // Example integration with a Kokoro/ElevenLabs TTS REST endpoint
  // Assume standard TTS endpoint that returns audio buffer
  const url = process.env.TTS_ENDPOINT || 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: script,
      model_id: "eleven_monolingual_v1",
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
  
  // Upload to permanent storage
  const permanentUrl = await uploadBufferToStorage(buffer, 'auto');
  return permanentUrl;
}
