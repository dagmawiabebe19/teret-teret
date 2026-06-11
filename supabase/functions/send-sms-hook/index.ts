/**
 * Supabase Auth Send SMS Hook — Africa's Talking + global daily SMS cap.
 * Deploy: supabase functions deploy send-sms-hook --no-verify-jwt
 * Secrets: SEND_SMS_HOOK_SECRET, AFRICASTALKING_USERNAME, AFRICASTALKING_API_KEY,
 *          AFRICASTALKING_SENDER_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DAILY_SMS_CAP (optional)
 */
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const DAILY_CAP_MESSAGE =
  "We've reached today's signup limit — please try again tomorrow. (We limit signups daily to prevent abuse.)";

const AT_API_URL =
  Deno.env.get("AFRICASTALKING_SANDBOX") === "true"
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";

function maskPhone(phone: string): string {
  if (phone.length <= 6) return "***";
  return phone.slice(0, 4) + "****" + phone.slice(-2);
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function sendViaAfricasTalking(
  to: string,
  message: string
): Promise<{ ok: boolean; detail: string; messageId?: string }> {
  const username = Deno.env.get("AFRICASTALKING_USERNAME");
  const apiKey = Deno.env.get("AFRICASTALKING_API_KEY");
  const senderId = Deno.env.get("AFRICASTALKING_SENDER_ID") ?? "";

  if (!username || !apiKey) {
    return { ok: false, detail: "Africa's Talking credentials not configured" };
  }

  const body = new URLSearchParams({
    username,
    to,
    message,
  });
  if (senderId) body.set("from", senderId);

  const response = await fetch(AT_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      apikey: apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await response.text();
  let parsed: { SMSMessageData?: { Recipients?: { status?: string; messageId?: string; statusCode?: number }[] } } = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    // non-JSON error body
  }

  const recipient = parsed.SMSMessageData?.Recipients?.[0];
  const statusCode = recipient?.statusCode;
  const success = response.ok && (statusCode === 101 || statusCode === 102 || recipient?.status === "Success");

  if (success) {
    return {
      ok: true,
      detail: "sent",
      messageId: recipient?.messageId,
    };
  }

  return {
    ok: false,
    detail: `AT HTTP ${response.status}: ${text.slice(0, 300)}`,
  };
}

async function reserveDailySlot(): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    console.error("[send-sms-hook] SUPABASE_URL or SERVICE_ROLE_KEY missing — blocking send");
    return false;
  }

  const capEnv = Deno.env.get("DAILY_SMS_CAP");
  const pCap = capEnv ? parseInt(capEnv, 10) : null;

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc("reserve_global_daily_sms_slot", {
    p_cap: pCap && !Number.isNaN(pCap) ? pCap : null,
  });

  if (error) {
    console.error("[send-sms-hook] reserve_global_daily_sms_slot failed:", error);
    return false;
  }

  return data === true;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: { message: "Method not allowed" } }, 405);
  }

  const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
  if (!hookSecret) {
    console.error("[send-sms-hook] SEND_SMS_HOOK_SECRET not set");
    return jsonResponse({ error: { message: "SMS hook not configured" } }, 500);
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const base64Secret = hookSecret.replace(/^v1,whsec_/, "");
  const wh = new Webhook(base64Secret);

  let user: { phone?: string };
  let sms: { otp?: string };

  try {
    const verified = wh.verify(payload, headers) as { user: { phone?: string }; sms: { otp?: string } };
    user = verified.user;
    sms = verified.sms;
  } catch (err) {
    console.error("[send-sms-hook] webhook verification failed:", err);
    return jsonResponse({ error: { message: "Invalid hook signature" } }, 401);
  }

  const phone = user.phone?.trim();
  const otp = sms.otp;

  if (!phone || !otp) {
    return jsonResponse({ error: { message: "Missing phone or OTP in hook payload" } }, 400);
  }

  const allowed = await reserveDailySlot();
  if (!allowed) {
    console.warn("[send-sms-hook] daily cap reached", { phone: maskPhone(phone) });
    return jsonResponse(
      {
        error: {
          http_code: 429,
          message: DAILY_CAP_MESSAGE,
        },
      },
      429
    );
  }

  const messageBody = `Your NalaDate verification code is: ${otp}. It expires in 10 minutes.`;
  console.log("[send-sms-hook] sending SMS", {
    phone: maskPhone(phone),
    atUrl: AT_API_URL,
  });

  const result = await sendViaAfricasTalking(phone, messageBody);

  if (!result.ok) {
    console.error("[send-sms-hook] Africa's Talking error:", {
      phone: maskPhone(phone),
      detail: result.detail,
    });
    return jsonResponse(
      {
        error: {
          http_code: 502,
          message: "Could not send verification SMS. Please try again shortly.",
        },
      },
      502
    );
  }

  console.log("[send-sms-hook] SMS sent", {
    phone: maskPhone(phone),
    messageId: result.messageId,
  });

  return jsonResponse({}, 200);
});
