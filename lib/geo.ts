import type { NextRequest } from "next/server";

type RequestWithGeo = NextRequest & { geo?: { country?: string } };

/** ISO country code from Vercel geo, x-vercel-ip-country, or Cloudflare cf-ipcountry. */
export function getCountryFromRequest(request: NextRequest | Request): string | null {
  const geo = (request as RequestWithGeo).geo;
  const fromGeo = geo?.country?.trim();
  if (fromGeo) return fromGeo.toUpperCase();

  const vercel = request.headers.get("x-vercel-ip-country")?.trim();
  if (vercel) return vercel.toUpperCase();

  const cf = request.headers.get("cf-ipcountry")?.trim();
  if (cf && cf !== "XX") return cf.toUpperCase();

  return null;
}

export function isEthiopiaCountry(country: string | null | undefined): boolean {
  return country?.toUpperCase() === "ET";
}

export function getCountryFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)teret_country=([^;]+)/);
  const value = match?.[1]?.trim();
  return value ? decodeURIComponent(value).toUpperCase() : null;
}
