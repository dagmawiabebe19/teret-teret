import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getOptionalUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const PRICE_ID = process.env.STRIPE_PRICE_ID;
  if (!secret || !PRICE_ID) {
    return NextResponse.redirect(new URL("/account", APP_URL));
  }
  const stripe = new Stripe(secret);
  try {
    const { user } = await getOptionalUser();
    if (!user?.id) {
      return NextResponse.redirect(new URL("/account?signin=1", APP_URL));
    }

    const admin = createAdminClient();
    let customerId: string | null = null;
    if (admin) {
      const { data: sub } = await admin
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .single();
      customerId = sub?.stripe_customer_id ?? null;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/account?success=1`,
      cancel_url: `${APP_URL}/account?cancel=1`,
      customer_email: customerId ? undefined : (user.email ?? undefined),
      customer: customerId ?? undefined,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
    });

    if (session.url) {
      return NextResponse.redirect(session.url);
    }
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e) {
    console.error("[stripe-checkout]", e);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
