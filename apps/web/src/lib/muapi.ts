export class MuapiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://api.muapi.ai';
  }

  private getKey(): string {
    const key = typeof window !== 'undefined' ? localStorage.getItem('muapi_key') : null;
    if (!key) throw new Error('API Key missing. Please set it in Settings.');
    return key;
  }

  async generateImage(params: {
    prompt: string;
    aspect_ratio?: string;
    model?: string;
  }) {
    const key = this.getKey();
    const endpoint = params.model === 'flux-dev' ? 'flux-dev-image' : 'flux-schnell-image';
    const url = `${this.baseUrl}/api/v1/${endpoint}`;

    const payload = {
      prompt: params.prompt,
      aspect_ratio: params.aspect_ratio || '1:1',
    };

    console.log('[Muapi] Requesting:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Request Failed: ${response.status} - ${errText}`);
    }

    const submitData = await response.json();
    const requestId = submitData.request_id || submitData.id;
    if (!requestId) {
      return submitData;
    }

    const result = await this.pollForResult(requestId, key);
    const imageUrl = result.outputs?.[0] || result.url || result.output?.url;
    return { ...result, url: imageUrl };
  }

  private async pollForResult(requestId: string, key: string, maxAttempts = 60, interval = 2000) {
    const pollUrl = `${this.baseUrl}/api/v1/predictions/${requestId}/result`;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, interval));
      console.log(`[Muapi] Polling attempt ${attempt}/${maxAttempts}...`);

      try {
        const response = await fetch(pollUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key
          }
        });

        if (!response.ok) {
          if (response.status >= 500) continue;
          throw new Error(`Poll Failed: ${response.status}`);
        }

        const data = await response.json();
        const status = data.status?.toLowerCase();

        if (status === 'completed' || status === 'succeeded' || status === 'success') {
          return data;
        }

        if (status === 'failed' || status === 'error') {
          throw new Error(`Generation failed: ${data.error || 'Unknown error'}`);
        }
      } catch (error: any) {
        if (attempt === maxAttempts) throw error;
      }
    }
    throw new Error('Generation timed out after polling.');
  }
}

export const muapi = new MuapiClient();
