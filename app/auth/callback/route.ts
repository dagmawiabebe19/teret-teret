import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_ERROR_MESSAGE_LENGTH = 500;

function redirectWithAuthError(
  origin: string,
  reason: string,
  details?: Record<string, unknown>
) {
  const safeMessage = reason.slice(0, MAX_ERROR_MESSAGE_LENGTH);
  console.error("[auth/callback] OAuth callback failed:", {
    reason: safeMessage,
    ...details,
  });
  const params = new URLSearchParams({
    error: "auth",
    error_message: safeMessage,
  });
  return NextResponse.redirect(`${origin}/account?${params.toString()}`);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");
  let next = searchParams.get("next") ?? "/account";
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/account";
  }

  const querySnapshot = Object.fromEntries(searchParams.entries());

  // Provider-level OAuth failure (user cancelled, redirect mismatch, etc.)
  if (oauthError) {
    const message = oauthErrorDescription ?? oauthError;
    console.error("[auth/callback] OAuth provider returned error:", {
      oauthError,
      oauthErrorDescription,
      next,
      query: querySnapshot,
      url: request.url,
    });
    return redirectWithAuthError(origin, message, {
      oauthError,
      oauthErrorDescription,
      query: querySnapshot,
    });
  }

  if (!code) {
    console.error("[auth/callback] Missing authorization code:", {
      next,
      query: querySnapshot,
      url: request.url,
    });
    return redirectWithAuthError(origin, "Missing authorization code", {
      query: querySnapshot,
    });
  }

  const supabase = await createClient();
  if (!supabase) {
    console.error("[auth/callback] Supabase client not configured:", {
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
    return redirectWithAuthError(origin, "Auth is not configured on the server", {
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", {
      message: error.message,
      status: error.status,
      code: error.code,
      name: error.name,
      fullError: error,
      query: querySnapshot,
    });
    return redirectWithAuthError(
      origin,
      error.message || "Session exchange failed",
      {
        supabaseCode: error.code,
        supabaseStatus: error.status,
        fullError: {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name,
        },
      }
    );
  }

  console.log("[auth/callback] Session established:", {
    next,
    userId: data.session?.user?.id ?? null,
  });
  return NextResponse.redirect(`${origin}${next}`);
}
