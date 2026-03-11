import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const stripeEnabled = !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PRICE_ID
  );
  if (process.env.NODE_ENV === "development") {
    console.log("[config] stripeConfigured:", stripeEnabled);
  }
  return NextResponse.json({
    stripeEnabled,
    stripeConfigured: stripeEnabled,
  });
}
