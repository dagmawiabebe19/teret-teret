import { NextResponse } from "next/server";

export async function GET() {
  const stripeEnabled = !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PRICE_ID
  );
  return NextResponse.json({ stripeEnabled });
}
