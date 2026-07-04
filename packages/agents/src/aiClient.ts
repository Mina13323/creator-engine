export interface AIClientOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: any;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

export class AIError extends Error {
  constructor(message: string, public status?: number, public provider?: string) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * Robust JSON parsing from LLM output.
 * Handles markdown code blocks, partial JSON, and trailing commas.
 */
export function parseLLMJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  
  // 1. Try direct parse
  try {
    return JSON.parse(raw) as T;
  } catch (e) {}

  // 2. Try to extract JSON block from markdown
  const match = raw.match(/\{[\s\S]*\}/) || raw.match(/\[[\s\S]*\]/);
  if (match) {
    let clean = match[0];
    try {
      return JSON.parse(clean) as T;
    } catch (e) {
      // 3. Very aggressive fallback - strip common trailing commas before closing braces
      clean = clean.replace(/,\s*([\]}])/g, '$1');
      try {
        return JSON.parse(clean) as T;
      } catch {
        return null;
      }
    }
  }
  return null;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Shared AI Service wrapper with Timeout and Retries
 */
async function fetchWithRetry(url: string, options: RequestInit, retries: number, retryDelayMs: number, timeoutMs: number, providerName: string): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // If rate limited or server error, throw to trigger retry
      if (response.status === 429 || response.status >= 500) {
         throw new AIError(`HTTP ${response.status}: ${response.statusText}`, response.status, providerName);
      }
      
      if (!response.ok) {
        // Bad request or unauthorized, don't retry
        const errText = await response.text();
        throw new AIError(`HTTP ${response.status}: ${errText}`, response.status, providerName);
      }
      
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      
      // Don't retry on client errors (except 429)
      if (err instanceof AIError && err.status && err.status < 500 && err.status !== 429) {
        throw err;
      }
      
      if (err.name === 'AbortError') {
        lastError = new AIError(`Request timed out after ${timeoutMs}ms`, 408, providerName);
      }

      console.warn(`[AIClient] ${providerName} attempt ${attempt + 1} failed: ${lastError?.message || 'Unknown error'}`);
      
      if (attempt < retries) {
        await delay(retryDelayMs * Math.pow(2, attempt)); // Exponential backoff
      }
    }
  }
  
  throw lastError || new AIError('Failed to fetch after retries', 500, providerName);
}

export async function callFireworksChat(systemPrompt: string, userPrompt: string, options: AIClientOptions = {}): Promise<string | null> {
  const fireworksKey = process.env.FIREWORKS_API_KEY_CHAT || process.env.FIREWORKS_API_KEY;
  if (!fireworksKey || fireworksKey.includes('your-')) {
    console.warn('[AIClient] Fireworks API key not configured.');
    return null;
  }

  const {
    model = 'accounts/fireworks/models/deepseek-v4-flash',
    temperature = 0.7,
    max_tokens = 4000,
    response_format = { type: 'json_object' },
    timeoutMs = 45000, // 45s timeout for complex tasks
    retries = 2,
    retryDelayMs = 1000
  } = options;

  try {
    const body: any = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens
    };

    if (response_format) {
      body.response_format = response_format;
    }

    const startTime = Date.now();
    const response = await fetchWithRetry(
      'https://api.fireworks.ai/inference/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fireworksKey}`
        },
        body: JSON.stringify(body)
      },
      retries,
      retryDelayMs,
      timeoutMs,
      'Fireworks'
    );

    const durationMs = Date.now() - startTime;
    const data = await response.json();
    
    const usage = data.usage || {};
    console.info(JSON.stringify({
      event: 'AI_INFERENCE',
      provider: 'Fireworks',
      model,
      durationMs,
      tokensPrompt: usage.prompt_tokens || 0,
      tokensCompletion: usage.completion_tokens || 0,
      tokensTotal: usage.total_tokens || 0,
      status: 'SUCCESS'
    }));

    return data.choices?.[0]?.message?.content || null;
  } catch (error: any) {
    console.error(JSON.stringify({
      event: 'AI_INFERENCE',
      provider: 'Fireworks',
      model,
      status: 'FAILED',
      error: error.message
    }));
    console.error('[AIClient] Fireworks Chat failed completely:', error);
    return null;
  }
}

export async function callGemini(systemPrompt: string, userPrompt: string, options: AIClientOptions = {}): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.includes('your-') || geminiKey === 'AIzaSy...') {
    console.warn('[AIClient] Gemini API key not configured.');
    return null;
  }

  const {
    model = 'gemini-1.5-flash',
    temperature = 0.7,
    max_tokens = 4096,
    timeoutMs = 15000,
    retries = 2,
    retryDelayMs = 1000,
    response_format
  } = options;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

  try {
    const response = await fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Request:\n${userPrompt}`
                }
              ]
            }
          ],
          generationConfig: {
            ...(response_format?.type === 'json_object' ? { responseMimeType: 'application/json' } : {}),
            temperature,
            maxOutputTokens: max_tokens
          }
        })
      },
      retries,
      retryDelayMs,
      timeoutMs,
      'Gemini'
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('[AIClient] Gemini Chat failed completely:', error);
    return null;
  }
}

export async function callLLMWithFallback(systemPrompt: string, userPrompt: string, options: AIClientOptions = {}): Promise<string | null> {
  console.log('[AIClient] Attempting primary LLM (Gemini)...');
  const geminiRes = await callGemini(systemPrompt, userPrompt, options);
  if (geminiRes) return geminiRes;

  console.log('[AIClient] Falling back to secondary LLM (Fireworks)...');
  const fwRes = await callFireworksChat(systemPrompt, userPrompt, options);
  if (fwRes) return fwRes;

  console.warn('[AIClient] All AI providers failed.');
  return null;
}

export async function callFireworksImage(prompt: string, aspectRatio: string = "16:9", options: AIClientOptions = {}): Promise<Buffer | null> {
  const fireworksKey = process.env.FIREWORKS_API_KEY_CHAT || process.env.FIREWORKS_API_KEY;
  if (!fireworksKey || fireworksKey.includes('your-')) {
    console.warn('[AIClient] Fireworks API key not configured.');
    return null;
  }

  const {
    model = 'black-forest-labs/FLUX.1-schnell',
    timeoutMs = 30000, // Image generation takes longer
    retries = 1,
    retryDelayMs = 2000
  } = options;

  const url = `https://api.fireworks.ai/inference/v1/image_generation/${model}`;

  try {
    const response = await fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fireworksKey}`,
          'Accept': 'image/jpeg'
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio
        })
      },
      retries,
      retryDelayMs,
      timeoutMs,
      'Fireworks-Image'
    );

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('[AIClient] Fireworks Image failed completely:', error);
    throw error;
  }
}
