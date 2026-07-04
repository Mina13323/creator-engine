import { VideoProvider, VideoProviderInput, VideoProviderOutput } from '../types';

export class JSON2VideoProvider implements VideoProvider {
  async generateVideo(input: VideoProviderInput): Promise<VideoProviderOutput> {
    const apiKey = process.env.JSON2VIDEO_API_KEY;
    if (!apiKey) {
      throw new Error('Configuration Error: JSON2VIDEO_API_KEY is not set.');
    }

    const scenes: any[] = [];

    if (input.scenes && input.scenes.length > 0) {
      input.scenes.forEach((s, idx) => {
        const sceneDuration = Number(s.duration) || 3;
        const elements: any[] = [];
        
        // Background Image
        if (s.imageUrl) {
          elements.push({
            type: "image",
            src: s.imageUrl,
            style: "pan"
          });
        } else if (input.images && input.images.length > 0) {
          elements.push({ type: "image", src: input.images[0], style: "pan" });
        }

        // Caption Text (styled)
        if (s.caption) {
          elements.push({
            type: "text",
            text: s.caption,
            style: "001",
            position: "bottom"
          });
        }

        // If it's the first scene, add the global audio
        if (idx === 0 && input.audioUrl) {
          elements.push({
            type: "audio",
            src: input.audioUrl
          });
        }

        scenes.push({
          duration: sceneDuration,
          elements
        });
      });
    } else {
      // Fallback
      scenes.push({
        duration: input.duration || 10,
        elements: [
          ...(input.images && input.images.length > 0 ? [{ type: "image", src: input.images[0] }] : []),
          { type: "text", text: (input.prompt || "Marketing Video").substring(0, 150) + "...", style: "001" },
          ...(input.audioUrl ? [{ type: "audio", src: input.audioUrl }] : [])
        ]
      });
    }

    const resolution = input.ratio === "9:16" ? "vertical" : "full-hd";

    const res = await fetch("https://api.json2video.com/v2/movies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        resolution,
        scenes
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`JSON2Video request failed: ${err}`);
    }

    const { project } = await res.json();
    console.info("[JSON2Video] Project ID:", project);

    // Poll for the result
    while (true) {
      const pollRes = await fetch(
        `https://api.json2video.com/v2/movies?project=${project}`,
        { headers: { "x-api-key": apiKey } }
      );
      
      if (!pollRes.ok) {
        throw new Error('JSON2Video polling failed');
      }

      const data = await pollRes.json();
      if (data.movie.status === "done") {
        return {
        url: data.movie.url,
        provider: 'json2video',
        duration: scenes.reduce((acc, s) => acc + s.duration, 0),
        generationType: 'COMPOSER_VIDEO'
      };
      }
      
      if (data.movie.status === "error") {
        throw new Error(data.movie.message || 'JSON2Video rendering failed');
      }
      
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}
