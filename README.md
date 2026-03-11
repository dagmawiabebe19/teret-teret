# ተረት ተረት — Teret Teret

Magical Ethiopian bedtime stories for children. Personalized stories in **Amharic**, **English**, and **Spanish**, with a child-safe G-rated experience.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Supabase** (auth + database)
- **Anthropic** (Claude) — **server-side only**, never from the browser
- **Stripe** (subscriptions)
- **Zod** (validation)

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

- **Supabase**: Create a project at [supabase.com](https://supabase.com). In Settings → API you’ll find `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. For server-side writes (webhooks, usage), use `SUPABASE_SERVICE_ROLE_KEY` from the same page (keep it secret).
- **Anthropic**: Get an API key from [console.anthropic.com](https://console.anthropic.com). Set `ANTHROPIC_API_KEY` in `.env.local`. This key is **only** used in the `/api/generate-story` route (server); it is never exposed to the client.
- **Illustration prompts** (optional): By default, illustration prompts are generated locally (no extra API calls). Set `AI_ILLUSTRATION_PROMPTS=true` to use Claude for richer, AI-generated prompts (adds one Anthropic call per story).
- **Stripe**: Create a product with a recurring price ($4.99/month). Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_PRICE_ID` (the price ID for the subscription). For webhooks, set `STRIPE_WEBHOOK_SECRET` (see Stripe section below).
- **App URL**: Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://teret-teret.vercel.app`). For local dev, `http://localhost:3000` is fine.

### 3. Supabase database

Run the migration in the Supabase SQL editor (Dashboard → SQL):

- Open `supabase/migrations/001_initial.sql` and execute its contents.

This creates `profiles`, `stories`, `usage_tracking`, `subscriptions`, RLS policies, and a trigger to create a profile + usage row on signup.

### 4. Supabase Auth

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `http://localhost:3000` (or your production URL)
- **Redirect URLs**: add `http://localhost:3000/auth/callback`, `http://localhost:3000/account`, and your production equivalents (e.g. `https://teret-teret.vercel.app/auth/callback`, `https://teret-teret.vercel.app/account`).

For **Google OAuth**: Authentication → Providers → Google → enable and add your OAuth client ID and secret from Google Cloud Console. The app’s “Continue with Google” button redirects back to `/account` after sign-in.

### 5. Stripe webhook (production)

For local testing you can use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the printed webhook signing secret as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

In production, add a webhook endpoint in the Stripe Dashboard pointing to `https://your-domain.com/api/stripe/webhook` and subscribe to:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Use the signing secret from the Dashboard as `STRIPE_WEBHOOK_SECRET` in Vercel (or your host) env.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

1. Push the repo and import the project in Vercel.
2. Add all env vars from `.env.example` in Vercel (Project → Settings → Environment Variables).
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://teret-teret.vercel.app`).
4. Run the Supabase migration if you haven’t already.
5. Configure Supabase redirect URLs to include `https://your-app.vercel.app/auth/callback`.
6. Configure the Stripe webhook to `https://your-app.vercel.app/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET` in Vercel.

## Features

- **Story generation**: Form (child name, age, trait, region) → POST `/api/generate-story` → server calls Anthropic → parsed [AM]/[EN]/[ES] story returned to client. No API key in the browser.
- **Free tier**: 3 stories per month (per user in DB; guests use localStorage).
- **Paywall**: When limit is reached, modal prompts subscription; Subscribe → `/api/stripe/checkout` → Stripe Checkout.
- **Auth**: Sign up / Sign in on `/account`; guest mode uses localStorage for saved stories and count.
- **Saved stories**: Logged-in users can have stories saved to Supabase; guests use localStorage.
- **Copy / Share / Export**: From the story end screen.

## Security

- **Anthropic**: Used only in `app/api/generate-story/route.ts`; `ANTHROPIC_API_KEY` is server-only.
- **Supabase**: `SUPABASE_SERVICE_ROLE_KEY` is used only in server routes (e.g. webhook, checkout); never in client code.
- **Stripe**: Secret key and webhook secret are server-only; publishable key is safe for the client.

## PWA

`public/manifest.json` and theme/background colors are set. Add `icon-192.png` and `icon-512.png` under `public/` for full PWA icon support.
