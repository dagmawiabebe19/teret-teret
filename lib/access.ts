import { isPremiumStatus } from "@/lib/premium";

export type ProfileAccessFields = {
  subscription_status?: string | null;
  is_ethiopia_free?: boolean | null;
};

/** Full app access: paid premium or permanent Ethiopia free tier. */
export function hasFullAccess(profile: ProfileAccessFields | null | undefined): boolean {
  if (!profile) return false;
  if (profile.is_ethiopia_free === true) return true;
  return isPremiumStatus(profile.subscription_status);
}

/** Signed-in users can save stories; generation limits stay gated by hasFullAccess. */
export function canSaveStories(userId: string | null | undefined): boolean {
  return Boolean(userId?.trim());
}

/** Azure / ElevenLabs narration for any signed-in user (guests use browser TTS). */
export function canUsePremiumNarration(userId: string | null | undefined): boolean {
  return Boolean(userId?.trim());
}
