import { callLLMWithFallback, parseLLMJson } from './aiClient';
import { getProjectContext, buildContextString, MarketingStudioGenerationModel } from '@creator/database';
import { generateAdImage } from './media/imageProvider';
import { generateMarketingVideo } from './media/videoProvider';
import { generateVoiceover } from './media/ttsProvider';
import crypto from 'crypto';

export async function runMarketingStudioAgent(input: {
  projectId: string;
  userId: string;
  prompt: string;
  productImages: string[];
  avatar: string;
  duration: number;
  ratio: string;
  quality: string;
}) {
  const { projectId, userId, prompt, productImages, avatar, duration, ratio, quality } = input;
  
  // 1. Load context
  const context = await getProjectContext(projectId, userId);
  const contextStr = buildContextString(context);
  
  // 2. Ad Strategy Generation
  const systemPrompt = `You are a world-class AI Marketing Director.
Your task is to generate a highly converting TikTok/Reels style video ad script based on this business context:
${contextStr}

Business Name: ${context.project?.name || 'Your Brand'}
Product: ${prompt}

Respond ONLY in valid JSON format:
{
  "hook": "TikTok/Reels style catchy opening",
  "script": "Full voiceover script with short emotional sentences",
  "scenes": [
    {
      "sceneNumber": 1,
      "visual": "Detailed visual prompt for AI image generation (e.g. 'A sleek product shot of X on a marble table, cinematic lighting')",
      "motionPrompt": "Cinematic camera movement and motion for AI video generator",
      "cameraMovement": "Pan right, slow zoom, etc.",
      "emotion": "Happy, energetic, luxurious, etc.",
      "voiceover": "Short spoken sentence for this scene",
      "caption": "Short text overlay for the screen",
      "duration": 3
    }
  ],
  "caption": "Social media post description",
  "hashtags": ["#marketing", "#ai"],
  "targetAudience": "Target audience",
  "platformRecommendation": "TikTok/Reels"
}`;

  const strategyStr = await callLLMWithFallback(systemPrompt, prompt, {
    model: 'accounts/fireworks/models/deepseek-v4-flash',
    response_format: { type: 'json_object' }
  });
  
  if (!strategyStr) {
    throw new Error('Failed to generate ad strategy from AI.');
  }

  const strategy = parseLLMJson<any>(strategyStr);
  if (!strategy || !strategy.script) {
    throw new Error('Invalid JSON returned for ad strategy.');
  }

  const generatedImages: any[] = [];
  let videoResult: any = null;
  let voiceUrl = '';
  let finalStatus = 'processing';
  
  try {
    // 3. Generate visual assets for EVERY scene via Flux
    const brandStyle = context.branding?.toneOfVoice || 'Premium and modern';
    
    // We run them in sequence to avoid rate limits, or Promise.all if allowed
    for (const scene of strategy.scenes) {
      try {
         const img = await generateAdImage({
           prompt: scene.visual,
           brandStyle,
           productImage: productImages[0]
         });
         scene.imageUrl = img.imageUrl;
         generatedImages.push({
           url: img.imageUrl,
           provider: img.provider
         });
      } catch (e) {
         console.warn(`Image generation failed for scene ${scene.sceneNumber}`, e);
         // fallback to main product image
         scene.imageUrl = productImages[0];
      }
    }

    // 4. Voice Generation
    try {
      voiceUrl = await generateVoiceover(strategy.script);
    } catch (e) {
      console.warn('Voice generation failed', e);
    }

    // 5. Video Generation
    try {
      videoResult = await generateMarketingVideo({
        script: strategy.script,
        scenes: strategy.scenes,
        images: [...productImages, ...(avatar ? [avatar] : [])],
        duration,
        ratio,
        audioUrl: voiceUrl
      });
    } catch (e) {
      console.warn('Video generation failed', e);
    }
  } catch (error) {
    console.error('Pipeline error:', error);
  }

  // Resolve final status based on available levels
  if (videoResult) {
    finalStatus = 'completed'; // Level 4
  } else if (voiceUrl) {
    finalStatus = 'SCRIPT_IMAGE_AUDIO_READY'; // Level 3
  } else if (generatedImages.length > 0) {
    finalStatus = 'SCRIPT_IMAGE_READY'; // Level 2
  } else {
    finalStatus = 'SCRIPT_READY'; // Level 1
  }

  // 6. DB Persistence
  const generationRecord = new MarketingStudioGenerationModel({
    id: `mkg_${crypto.randomUUID()}`,
    userId,
    projectId,
    prompt,
    businessContextSnapshot: context,
    script: strategy,
    scenes: strategy.scenes,
    images: generatedImages,
    video: videoResult ? {
      url: videoResult.url,
      provider: videoResult.provider,
      duration: videoResult.duration,
      generationType: videoResult.generationType
    } : undefined,
    voice: voiceUrl ? { url: voiceUrl } : undefined,
    status: finalStatus
  });

  await generationRecord.save();

  return generationRecord.toObject();
}
