import { hasFullAccess } from "@/lib/access";
import { getCountryFromRequest } from "@/lib/geo";
import { createAdminClient } from "@/lib/supabase/admin";

export type ResolvedProfileAccess = {
  subscription_status: string;
  is_ethiopia_free: boolean;
  signup_country: string | null;
  hasFullAccess: boolean;
};

/**
 * On first authenticated request, records signup_country from geo (once).
 * If country is ET, sets is_ethiopia_free permanently.
 */
export async function ensureEthiopiaSignupCountry(
  userId: string,
  request: Request
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: profile } = await admin
    .from("profiles")
    .select("signup_country, is_ethiopia_free")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || profile.signup_country != null) return;

  const country = getCountryFromRequest(request);
  if (!country) return;

  await admin
    .from("profiles")
    .update({
      signup_country: country,
      is_ethiopia_free: country === "ET",
    })
    .eq("id", userId)
    .is("signup_country", null);
}

export async function resolveProfileAccess(
  userId: string,
  request: Request
): Promise<ResolvedProfileAccess> {
  await ensureEthiopiaSignupCountry(userId, request);

  const admin = createAdminClient();
  if (!admin) {
    return {
      subscription_status: "free",
      is_ethiopia_free: false,
      signup_country: null,
      hasFullAccess: false,
    };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("subscription_status, is_ethiopia_free, signup_country")
    .eq("id", userId)
    .single();

  const subscription_status = profile?.subscription_status ?? "free";
  const is_ethiopia_free = profile?.is_ethiopia_free === true;
  const signup_country = profile?.signup_country ?? null;

  return {
    subscription_status,
    is_ethiopia_free,
    signup_country,
    hasFullAccess: hasFullAccess({ subscription_status, is_ethiopia_free }),
  };
}
