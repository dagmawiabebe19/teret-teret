import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkVerifySoftLock,
  clearVerifyFailures,
  generateDisplayName,
  getClientIp,
  logOtpAttempt,
  recordVerifyFailure,
  validatePhoneBody,
} from "@/lib/phoneAuthServer";

const INVALID_CODE_MESSAGE = "Code is incorrect or expired. Try again or resend.";

export async function POST(request: Request) {
  let body: { phone?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { phone, code } = body;
  if (!validatePhoneBody(phone) || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
    return NextResponse.json({ error: INVALID_CODE_MESSAGE }, { status: 400 });
  }

  const normalized = phone.trim();
  const token = code.trim();
  const ip = getClientIp(request);

  const lockCheck = await checkVerifySoftLock(normalized);
  if (!lockCheck.allowed) {
    await logOtpAttempt({
      phone: normalized,
      ip,
      action: "verify",
      success: false,
      errorReason: "verify_lock",
    });
    return NextResponse.json({ error: lockCheck.reason, code: "verify_lock" }, { status: 429 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Connection issue. Please check your internet and try again." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token,
    type: "sms",
  });

  if (error || !data.user) {
    await recordVerifyFailure(normalized);
    await logOtpAttempt({
      phone: normalized,
      ip,
      action: "verify",
      success: false,
      errorReason: error?.message ?? "invalid",
    });
    return NextResponse.json({ error: INVALID_CODE_MESSAGE }, { status: 401 });
  }

  await clearVerifyFailures(normalized);
  await logOtpAttempt({ phone: normalized, ip, action: "verify", success: true });

  const userId = data.user.id;
  const admin = createAdminClient();

  let isNewUser = true;

  if (admin) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id, phone_verified_at, auth_method, display_name")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.phone_verified_at && profile.auth_method === "phone") {
      isNewUser = false;
    } else {
      const displayName = profile?.display_name ?? generateDisplayName();
      isNewUser = !profile?.phone_verified_at;

      if (profile) {
        await admin
          .from("profiles")
          .update({
            phone: normalized,
            auth_method: "phone",
            phone_verified_at: new Date().toISOString(),
            display_name: displayName,
          })
          .eq("id", userId);
      } else {
        await admin.from("profiles").insert({
          id: userId,
          phone: normalized,
          auth_method: "phone",
          phone_verified_at: new Date().toISOString(),
          display_name: displayName,
        });
      }
    }
  }

  return NextResponse.json({ success: true, isNewUser });
}
