import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const stripe = new Stripe(secret);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    console.error("[stripe-webhook] Supabase admin not configured");
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const subId = session.subscription as string;
      if (!userId || !subId) break;
      const sub = await stripe.subscriptions.retrieve(subId);
      await admin.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subId,
        status: sub.status,
        current_period_end: new Date((sub.current_period_end ?? 0) * 1000).toISOString(),
      }, { onConflict: "user_id" });
      await admin.from("profiles").update({ subscription_status: "premium" }).eq("id", userId);
      console.log("[teret] Stripe subscription synced: checkout completed", { userId, subId });
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      let userId = sub.metadata?.user_id as string | undefined;
      if (!userId) {
        const { data: row } = await admin.from("subscriptions").select("user_id").eq("stripe_subscription_id", sub.id).single();
        userId = row?.user_id;
      }
      if (!userId) break;
      const status = (sub.status === "active" || sub.status === "trialing") ? "premium" : "free";
      await admin.from("subscriptions").update({
        status: sub.status,
        current_period_end: new Date((sub.current_period_end ?? 0) * 1000).toISOString(),
      }).eq("stripe_subscription_id", sub.id);
      await admin.from("profiles").update({ subscription_status: status }).eq("id", userId);
      console.log("[teret] Stripe subscription synced:", event.type, { userId, status });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
