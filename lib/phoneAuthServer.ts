import { createAdminClient } from "@/lib/supabase/admin";
import { isValidE164 } from "@/lib/phoneCountries";

const PHONE_PER_HOUR = 3;
const IP_PER_HOUR = 5;
const RESEND_COOLDOWN_SEC = 60;
const VERIFY_FAIL_LOCK = 5;
const VERIFY_LOCK_MINUTES = 15;

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

export async function logOtpAttempt(params: {
  phone: string;
  ip: string;
  action: "send" | "resend" | "verify";
  success: boolean;
  errorReason?: string;
}) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("otp_attempt_logs").insert({
    phone: params.phone,
    ip_address: params.ip,
    action: params.action,
    success: params.success,
    error_reason: params.errorReason ?? null,
  });
}

export async function checkPhoneEmailConflict(phone: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  const { data, error } = await admin.rpc("check_phone_email_conflict", { p_phone: phone });
  if (error) {
    console.error("[phone-auth] conflict check failed", error);
    return false;
  }
  return data === true;
}

export async function checkProfileAuthConflict(phone: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  const { data } = await admin
    .from("profiles")
    .select("auth_method")
    .eq("phone", phone)
    .neq("auth_method", "phone")
    .maybeSingle();
  return !!data;
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: string; code: "phone" | "ip" | "resend" | "verify_lock" };

export async function checkOtpSendRateLimits(
  phone: string,
  ip: string,
  options?: { enforceResendCooldown?: boolean }
): Promise<RateLimitResult> {
  const admin = createAdminClient();
  if (!admin) return { allowed: true };

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [{ count: phoneCount }, { count: ipCount }] = await Promise.all([
    admin
      .from("otp_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("phone", phone)
      .gte("attempt_at", hourAgo),
    admin
      .from("otp_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("attempt_at", hourAgo),
  ]);

  if ((phoneCount ?? 0) >= PHONE_PER_HOUR) {
    return {
      allowed: false,
      code: "phone",
      reason: "Too many attempts. Please try again in an hour.",
    };
  }

  if ((ipCount ?? 0) >= IP_PER_HOUR) {
    return {
      allowed: false,
      code: "ip",
      reason: "Too many attempts from this device. Please try again later.",
    };
  }

  if (options?.enforceResendCooldown) {
    const { data: recent } = await admin
      .from("otp_rate_limits")
      .select("attempt_at")
      .eq("phone", phone)
      .order("attempt_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent?.attempt_at) {
      const elapsed = (Date.now() - new Date(recent.attempt_at).getTime()) / 1000;
      if (elapsed < RESEND_COOLDOWN_SEC) {
        const wait = Math.ceil(RESEND_COOLDOWN_SEC - elapsed);
        return {
          allowed: false,
          code: "resend",
          reason: `Please wait ${wait} seconds`,
        };
      }
    }
  }

  return { allowed: true };
}

export async function recordOtpSendAttempt(phone: string, ip: string) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("otp_rate_limits").insert({ phone, ip_address: ip });
}

export async function checkVerifySoftLock(phone: string): Promise<RateLimitResult> {
  const admin = createAdminClient();
  if (!admin) return { allowed: true };

  const since = new Date(Date.now() - VERIFY_LOCK_MINUTES * 60 * 1000).toISOString();
  const { count } = await admin
    .from("otp_verify_failures")
    .select("*", { count: "exact", head: true })
    .eq("phone", phone)
    .gte("failed_at", since);

  if ((count ?? 0) >= VERIFY_FAIL_LOCK) {
    return {
      allowed: false,
      code: "verify_lock",
      reason: "Too many incorrect attempts. Please wait 15 minutes or resend a new code.",
    };
  }
  return { allowed: true };
}

export async function recordVerifyFailure(phone: string) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("otp_verify_failures").insert({ phone });
}

export async function clearVerifyFailures(phone: string) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("otp_verify_failures").delete().eq("phone", phone);
}

export function validatePhoneBody(phone: unknown): phone is string {
  return typeof phone === "string" && isValidE164(phone.trim());
}

export function generateDisplayName(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `user_${suffix}`;
}
