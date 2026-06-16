import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callGemini, callFireworksChat, callLLMWithFallback, parseLLMJson, AIError } from '../../../packages/agents/src/aiClient';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('AI Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test_gemini';
    process.env.FIREWORKS_API_KEY = 'test_fireworks';
  });

  it('parseLLMJson should handle valid JSON', () => {
    const json = '{"key":"value"}';
    const result = parseLLMJson<{key:string}>(json);
    expect(result?.key).toBe('value');
  });

  it('parseLLMJson should strip markdown blocks and parse', () => {
    const markdown = "```json\n{\n  \"key\": \"value\"\n}\n```";
    const result = parseLLMJson<{key:string}>(markdown);
    expect(result?.key).toBe('value');
  });

  it('parseLLMJson should handle trailing commas', () => {
    const trailing = '{"key":"value",}';
    const result = parseLLMJson<{key:string}>(trailing);
    expect(result?.key).toBe('value');
  });

  it('callGemini should return text on success', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'gemini response' }] } }]
      })
    });
    
    const res = await callGemini('sys', 'user');
    expect(res).toBe('gemini response');
  });

  it('callLLMWithFallback should fall back to fireworks if gemini fails', async () => {
    // First call (Gemini) fails with 500
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    });
    
    // Second call (Fireworks) succeeds
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'fireworks fallback' } }]
      })
    });

    const res = await callLLMWithFallback('sys', 'user', { retries: 0 });
    expect(res).toBe('fireworks fallback');
  });
  
  it('callFireworksChat returns null on hard failure after retries', async () => {
    // Fireworks fails repeatedly with 500
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    });

    const res = await callFireworksChat('sys', 'user', { retries: 1 });
    expect(res).toBeNull();
  });
});
