import { createClient } from "@/lib/supabase/server";
import {
  checkOtpSendRateLimits,
  checkPhoneEmailConflict,
  checkProfileAuthConflict,
  getClientIp,
  logOtpAttempt,
  recordOtpSendAttempt,
  validatePhoneBody,
} from "@/lib/phoneAuthServer";

const EMAIL_ACCOUNT_MESSAGE =
  "This number is associated with an email account. Sign in with email.";

const SMS_FAIL_MESSAGE =
  "Couldn't send code. Please try again or use Google sign-in.";

const NETWORK_MESSAGE =
  "Connection issue. Please check your internet and try again.";

export type SendOtpResult =
  | { success: true }
  | { success: false; error: string; status: number; code?: string };

export async function sendPhoneOtp(
  request: Request,
  body: unknown,
  action: "send" | "resend"
): Promise<SendOtpResult> {
  const phone = typeof body === "object" && body && "phone" in body
    ? (body as { phone: unknown }).phone
    : undefined;

  if (!validatePhoneBody(phone)) {
    return { success: false, error: "Invalid phone number", status: 400 };
  }

  const normalized = phone.trim();
  const ip = getClientIp(request);

  if (await checkPhoneEmailConflict(normalized) || (await checkProfileAuthConflict(normalized))) {
    await logOtpAttempt({
      phone: normalized,
      ip,
      action,
      success: false,
      errorReason: "email_conflict",
    });
    return { success: false, error: EMAIL_ACCOUNT_MESSAGE, status: 409, code: "email_conflict" };
  }

  const rateCheck = await checkOtpSendRateLimits(normalized, ip, {
    enforceResendCooldown: action === "resend",
  });
  if (!rateCheck.allowed) {
    await logOtpAttempt({
      phone: normalized,
      ip,
      action,
      success: false,
      errorReason: rateCheck.code,
    });
    return {
      success: false,
      error: rateCheck.reason,
      status: 429,
      code: rateCheck.code,
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { success: false, error: NETWORK_MESSAGE, status: 503 };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({ phone: normalized });

    if (error) {
      console.error("[phone-auth] signInWithOtp", error);
      const msg = error.message?.toLowerCase() ?? "";
      const userMessage =
        msg.includes("network") || msg.includes("fetch")
          ? NETWORK_MESSAGE
          : SMS_FAIL_MESSAGE;
      await logOtpAttempt({
        phone: normalized,
        ip,
        action,
        success: false,
        errorReason: error.message,
      });
      return { success: false, error: userMessage, status: 502, code: "sms_failed" };
    }

    await recordOtpSendAttempt(normalized, ip);
    await logOtpAttempt({ phone: normalized, ip, action, success: true });
    return { success: true };
  } catch (err) {
    console.error("[phone-auth] send exception", err);
    await logOtpAttempt({
      phone: normalized,
      ip,
      action,
      success: false,
      errorReason: "exception",
    });
    return { success: false, error: NETWORK_MESSAGE, status: 503 };
  }
}
