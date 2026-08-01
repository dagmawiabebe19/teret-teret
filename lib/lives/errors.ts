/** Friendly client-facing copy for scene-generation failures (never leak raw model output). */
export function friendlySceneError(message: string | undefined | null): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("malformed") || m.includes("did not call render_scene")) {
    return "Something went wrong writing that scene. Please try again.";
  }
  if (m.includes("anthropic_api_key")) {
    return "Story generation is temporarily unavailable. Please try again later.";
  }
  return message?.trim() || "Could not generate the scene. Please try again.";
}
