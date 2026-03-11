import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOptionalUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Creates a Stripe Checkout session for subscription ($4.99/month).
 * Server-only: uses STRIPE_SECRET_KEY and STRIPE_PRICE_ID.
 * Webhook (checkout.session.completed, customer.subscription.updated/deleted) syncs
 * subscription status to profiles.subscription_status via app/api/stripe/webhook.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const PRICE_ID = process.env.STRIPE_PRICE_ID;
  if (!secret || !PRICE_ID) {
    return NextResponse.json(
      { error: "Stripe not configured", redirect: `${APP_URL}/account` },
      { status: 503 }
    );
  }

  const { user } = await getOptionalUser();
  if (!user?.id) {
    return NextResponse.json(
      { error: "Sign in to subscribe", redirect: `${APP_URL}/account?signin=1` },
      { status: 401 }
    );
  }

  let returnToPath = "/";
  let returnTo = `${APP_URL}/account`;
  try {
    const body = await request.json();
    if (typeof body?.returnTo === "string" && body.returnTo.startsWith("/")) {
      returnToPath = body.returnTo;
      returnTo = `${APP_URL}${body.returnTo}`;
    }
  } catch {
    // ignore, use default
  }

  const stripe = new Stripe(secret);
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

  const successReturnTo = encodeURIComponent(returnToPath);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/account?success=1&returnTo=${successReturnTo}`,
      cancel_url: returnTo,
      customer_email: customerId ? undefined : (user.email ?? undefined),
      customer: customerId ?? undefined,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create checkout session" },
        { status: 500 }
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[create-checkout-session]", e);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
