import { NextResponse } from "next/server";
import { getCountryFromCookie, getCountryFromRequest, isEthiopiaCountry } from "@/lib/geo";

export const dynamic = "force-dynamic";

/** Returns detected visitor country for Ethiopia-tailored homepage UI. */
export async function GET(request: Request) {
  const fromHeaders = getCountryFromRequest(request);
  const fromCookie = getCountryFromCookie(request.headers.get("cookie"));
  const country = fromHeaders ?? fromCookie;

  return NextResponse.json({
    country,
    isEthiopia: isEthiopiaCountry(country),
  });
}
