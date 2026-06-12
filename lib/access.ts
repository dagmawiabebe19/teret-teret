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
