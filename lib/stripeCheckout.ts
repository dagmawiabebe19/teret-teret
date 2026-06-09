/** Start Stripe Checkout via POST /api/create-checkout-session; redirects on success. */
export async function startStripeCheckout(returnTo = "/"): Promise<{
  ok: boolean;
  error?: string;
}> {
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnTo }),
  });
  const data = await res.json().catch(() => ({}));

  if (res.ok && data.url) {
    window.location.href = data.url;
    return { ok: true };
  }
  if ((res.status === 401 || res.status === 503) && data.redirect) {
    window.location.href = data.redirect;
    return { ok: false };
  }
  return { ok: false, error: data.error ?? "Could not start checkout" };
}
