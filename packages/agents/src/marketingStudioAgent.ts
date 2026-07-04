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
Your task is to generate a highly converting marketing video script based on the following business context and user prompt.
${contextStr}

Respond ONLY in valid JSON format with the following structure:
{
  "hook": "Catchy opening phrase",
  "script": "Full voiceover script",
  "scenes": [
    {
      "sceneNumber": "1",
      "visual": "Description of what is shown on screen",
      "camera": "Camera movement/angle",
      "voiceover": "Spoken text for this scene",
      "duration": "2s"
    }
  ],
  "caption": "Social media post caption",
  "hashtags": ["#marketing", "#ai"],
  "targetAudience": "Description of the target audience",
  "platformRecommendation": "Instagram Reels, TikTok, etc."
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
    // 3. Optional: Generate supplemental images (if product images not sufficient, or to create backgrounds)
    // We can also skip this if we just use the user uploaded product images for the video.
    // Let's generate one brand image as per Phase 3 Step 2.
    const brandStyle = context.branding?.toneOfVoice || 'Premium and modern';
    try {
       const img = await generateAdImage({
         prompt: strategy.scenes[0]?.visual || prompt,
         brandStyle,
         productImage: productImages[0]
       });
       generatedImages.push(img);
    } catch (e) {
       console.warn('Image generation failed, proceeding without supplemental image', e);
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
        images: [...productImages, ...(avatar ? [avatar] : [])],
        duration,
        ratio
      });
      finalStatus = 'completed';
    } catch (e) {
      console.warn('Video generation failed or returned PARTIAL_SUCCESS', e);
      finalStatus = 'PARTIAL_SUCCESS';
    }

  } catch (error) {
    console.error('Pipeline error:', error);
    finalStatus = 'PARTIAL_SUCCESS'; // Proceed with what we have
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
      duration: videoResult.duration
    } : undefined,
    voice: voiceUrl ? { url: voiceUrl } : undefined,
    status: finalStatus
  });

  await generationRecord.save();

  return generationRecord.toObject();
}
