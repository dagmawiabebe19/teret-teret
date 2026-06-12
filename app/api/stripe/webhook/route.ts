import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ANALYTICS_EVENTS } from "@/lib/analyticsEvents";
import { createAdminClient } from "@/lib/supabase/admin";
import { insertAnalyticsEvent } from "@/lib/serverAnalytics";

function stripeId(value: string | Stripe.Customer | Stripe.DeletedCustomer | Stripe.Subscription | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if ("id" in value && typeof value.id === "string") return value.id;
  return null;
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secret = process.env.STRIPE_SECRET_KEY;
  const logs: string[] = [];

  const log = (msg: string, extra?: Record<string, unknown>) => {
    const line = extra ? `${msg} ${JSON.stringify(extra)}` : msg;
    console.error("[stripe-webhook]", line);
    logs.push(line);
  };

  if (!secret || !webhookSecret) {
    log("Stripe not configured", { hasSecret: !!secret, hasWebhookSecret: !!webhookSecret });
    return NextResponse.json({ error: "Stripe not configured", logs }, { status: 503 });
  }

  const stripe = new Stripe(secret);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    log("Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature", logs }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    log("Signature verification failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Invalid signature", logs }, { status: 400 });
  }

  log("Event received", { type: event.type, id: event.id });

  const admin = createAdminClient();
  if (!admin) {
    log("Supabase admin client unavailable — check SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json({ error: "Server config error", logs }, { status: 500 });
  }
  log("Using Supabase service role client (bypasses RLS)");

  const errors: string[] = [];

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id ?? null;
      const subId = stripeId(session.subscription);
      const customerId = stripeId(session.customer);

      log("checkout.session.completed parsed", {
        sessionId: session.id,
        userIdFromMetadata: userId,
        subscriptionId: subId,
        customerId,
        metadata: session.metadata,
      });

      if (!userId) {
        errors.push("Missing user_id in session.metadata");
        log("Aborting: no user_id in event.data.object.metadata", { metadata: session.metadata });
        break;
      }
      if (!subId) {
        errors.push("Missing subscription id on checkout session");
        log("Aborting: session.subscription is empty", { sessionId: session.id });
        break;
      }

      let sub: Stripe.Subscription;
      try {
        sub = await stripe.subscriptions.retrieve(subId);
        log("Retrieved Stripe subscription", { subId, status: sub.status });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to retrieve subscription: ${msg}`);
        log("Stripe subscriptions.retrieve failed", { subId, error: msg });
        break;
      }

      const subUpsert = await admin.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subId,
          status: sub.status,
          current_period_end: new Date((sub.current_period_end ?? 0) * 1000).toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (subUpsert.error) {
        errors.push(`subscriptions upsert: ${subUpsert.error.message}`);
        log("Supabase subscriptions upsert failed", {
          userId,
          code: subUpsert.error.code,
          message: subUpsert.error.message,
          details: subUpsert.error.details,
        });
      } else {
        log("Supabase subscriptions upsert ok", { userId, subId });
      }

      log("Updating profiles.subscription_status to premium", { userId });
      const profileUpdate = await admin
        .from("profiles")
        .update({ subscription_status: "premium" })
        .eq("id", userId)
        .select("id, subscription_status");

      if (profileUpdate.error) {
        errors.push(`profiles update: ${profileUpdate.error.message}`);
        log("Supabase profiles update failed", {
          userId,
          code: profileUpdate.error.code,
          message: profileUpdate.error.message,
          details: profileUpdate.error.details,
          hint: profileUpdate.error.hint,
        });
      } else {
        log("Supabase profiles update ok", {
          userId,
          rows: profileUpdate.data,
        });
        await insertAnalyticsEvent(admin, {
          eventName: ANALYTICS_EVENTS.SUBSCRIPTION_STARTED,
          request,
          userId,
          properties: { stripe_subscription_id: subId },
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      let userId = (sub.metadata?.user_id as string | undefined) ?? null;

      log(`${event.type} parsed`, { subId: sub.id, userIdFromMetadata: userId });

      if (!userId) {
        const { data: row, error: lookupError } = await admin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .single();
        if (lookupError) {
          log("subscriptions lookup by stripe_subscription_id failed", {
            subId: sub.id,
            message: lookupError.message,
          });
        }
        userId = row?.user_id ?? null;
        log("Resolved user_id from subscriptions table", { userId });
      }

      if (!userId) {
        errors.push("Could not resolve user_id for subscription event");
        log("Aborting: no user_id");
        break;
      }

      const status = sub.status === "active" || sub.status === "trialing" ? "premium" : "free";

      const subUpdate = await admin
        .from("subscriptions")
        .update({
          status: sub.status,
          current_period_end: new Date((sub.current_period_end ?? 0) * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);

      if (subUpdate.error) {
        errors.push(`subscriptions update: ${subUpdate.error.message}`);
        log("Supabase subscriptions update failed", { message: subUpdate.error.message });
      }

      log("Updating profiles.subscription_status", { userId, status });
      const profileUpdate = await admin
        .from("profiles")
        .update({ subscription_status: status })
        .eq("id", userId)
        .select("id, subscription_status");

      if (profileUpdate.error) {
        errors.push(`profiles update: ${profileUpdate.error.message}`);
        log("Supabase profiles update failed", { message: profileUpdate.error.message });
      } else {
        log("Supabase profiles update ok", { userId, rows: profileUpdate.data });
        if (event.type === "customer.subscription.deleted" || status === "free") {
          await insertAnalyticsEvent(admin, {
            eventName: ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
            request,
            userId,
            properties: { stripe_status: sub.status },
          });
        } else if (status === "premium") {
          await insertAnalyticsEvent(admin, {
            eventName: ANALYTICS_EVENTS.SUBSCRIPTION_STARTED,
            request,
            userId,
            properties: { stripe_status: sub.status },
          });
        }
      }
      break;
    }
    default:
      log("Unhandled event type (no action taken)", { type: event.type });
      break;
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { received: true, ok: false, errors, logs },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true, ok: true, logs });
}
