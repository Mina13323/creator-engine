export class ApiClient {
  async generateImage(params: {
    prompt: string;
    aspect_ratio?: string;
    model?: string;
  }) {
    console.info('[API] generateImage requested:', params);

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
    console.info('[API] Real uploadFile requested:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || '';
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result.url);
          } catch (e) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || 'Upload failed'));
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Network error occurred during upload'));
      };
      
      xhr.open('POST', 'http://localhost:5000/api/upload');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  async generateMarketingStudioAd(params: {
    projectId: string;
    prompt: string;
    aspect_ratio?: string;
    duration?: number;
    images_list?: string[];
    video_files?: string[];
  }) {
    console.info('[API] generateMarketingStudioAd requested:', params);
    
    // We get the token manually to avoid circular dependencies
    let token = '';
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed?.state?.user?.token || localStorage.getItem('token') || '';
        } catch(e) {}
      }
      if (!token) token = localStorage.getItem('token') || '';
    }

    const response = await fetch('http://localhost:5000/api/marketing-studio/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorMessage = 'Marketing Studio Generation failed';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        console.warn('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }
}

export const api = new ApiClient();
