import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getOptionalUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.redirect(new URL("/account", APP_URL));
  }
  const stripe = new Stripe(secret);
  try {
    const { user } = await getOptionalUser();
    if (!user?.id) {
      return NextResponse.redirect(new URL("/account", APP_URL));
    }

    const admin = createAdminClient();
    const { data: sub } = await admin
      ?.from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single() ?? { data: null };

    const customerId = sub?.stripe_customer_id;
    if (!customerId) {
      return NextResponse.redirect(new URL("/account", APP_URL));
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/account`,
    });

    if (session.url) {
      return NextResponse.redirect(session.url);
    }
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e) {
    console.error("[stripe-portal]", e);
    return NextResponse.json(
      { error: "Could not open billing portal" },
      { status: 500 }
    );
  }
}
