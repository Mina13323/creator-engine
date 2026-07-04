import { callHuggingFaceImage } from '../aiClient';
import { uploadBufferToStorage } from './storageProvider';

export interface ImageResult {
  imageUrl: string;
  provider: string;
  metadata?: any;
}

export async function generateAdImage(input: {
  prompt: string;
  brandStyle?: string;
  productImage?: string;
}): Promise<ImageResult> {
  const fullPrompt = `${input.prompt} ${input.brandStyle ? 'Brand Style: ' + input.brandStyle : ''}`;

  try {
    const buffer = await callHuggingFaceImage(fullPrompt, "16:9");
    if (buffer) {
      const secureUrl = await uploadBufferToStorage(buffer, 'image');
      return {
        imageUrl: secureUrl,
        provider: 'huggingface-flux',
      };
    }
    
    throw new Error('Image generation failed');
  } catch (error) {
    console.error('Failed to generate ad image:', error);
    throw error;
  }
}
