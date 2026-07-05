export interface VideoProviderInput {
  prompt: string;
  images?: string[];
  scenes?: any[];
  duration?: number;
  audioUrl?: string;
  ratio?: string;
}

export interface VideoProviderOutput {
  url: string;
  provider: string;
  duration?: number;
  generationType?: string;
}

export interface VideoProvider {
  generateVideo(input: VideoProviderInput): Promise<VideoProviderOutput>;
}

export interface TTSProviderInput {
  script: string;
}

export interface TTSProviderOutput {
  url: string;
  provider: string;
  audioUrl?: string;
  duration?: number;
}

export interface TTSProvider {
  generateVoiceover(input: TTSProviderInput): Promise<TTSProviderOutput>;
}
