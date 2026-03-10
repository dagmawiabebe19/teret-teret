/**
 * Image generation service abstraction for Teret-Teret.
 *
 * Pluggable with:
 * - OpenAI DALL·E / Image API
 * - Replicate (SDXL, Flux, etc.)
 * - Stability AI
 * - Other image generation APIs
 *
 * Usage: Implement generateImage() and call from your API route
 * when illustration prompts are ready and image API is configured.
 */

export interface ImageGenerationResult {
  url?: string;
  base64?: string;
  error?: string;
}

export interface ImageGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  /** Provider-specific options */
  provider?: "openai" | "replicate" | "stability" | "custom";
}

/**
 * Generate an image from a prompt.
 * Override this with your chosen provider.
 *
 * Example (OpenAI):
 *   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *   const res = await openai.images.generate({ model: "dall-e-3", prompt, n: 1 });
 *   return { url: res.data[0]?.url };
 *
 * Example (Replicate):
 *   const output = await replicate.run("stability-ai/sdxl", { input: { prompt } });
 *   return { url: output[0] };
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  // Placeholder: no image API configured
  // Set env vars and implement to enable:
  // - OPENAI_API_KEY for DALL·E
  // - REPLICATE_API_TOKEN for Replicate
  // - STABILITY_API_KEY for Stability AI
  return {
    error: "Image generation not configured. Set API keys and implement generateImage().",
  };
}
