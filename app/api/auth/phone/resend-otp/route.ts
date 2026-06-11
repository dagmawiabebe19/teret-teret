import { NextResponse } from "next/server";
import { sendPhoneOtp } from "@/lib/phoneAuthSendOtp";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = await sendPhoneOtp(request, body, "resend");

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: result.status }
    );
  }

  return NextResponse.json({ success: true });
}
