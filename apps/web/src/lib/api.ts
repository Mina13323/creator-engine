export class ApiClient {
  async generateImage(params: {
    prompt: string;
    aspect_ratio?: string;
    model?: string;
  }) {
    console.log('[API] generateImage requested:', params);

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: params.prompt,
        model: params.model,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Image generation failed');
    }

    return response.json() as Promise<{ url: string; id: string }>;
  }

  async uploadFile(file: File, onProgress?: (pct: number) => void): Promise<string> {
    console.log('[API] Mock uploadFile requested:', file.name);
    // Simulate upload progress
    if (onProgress) {
      for (let i = 10; i <= 100; i += 20) {
        onProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Return a dummy file URL (avatar or UGC video depending on file type)
    if (file.type.startsWith('video/')) {
      return "https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc.mp4";
    }
    return "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Sora.webp";
  }

  async generateMarketingStudioAd(params: {
    prompt: string;
    aspect_ratio?: string;
    duration?: number;
    images_list?: string[];
    video_files?: string[];
  }) {
    console.log('[API] Mock generateMarketingStudioAd requested:', params);
    // Simulate longer generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Return a dummy video URL
    return {
      url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc_how_to.mp4",
      id: "mock-video-" + Date.now()
    };
  }
}

export const api = new ApiClient();
