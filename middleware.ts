import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCountryFromRequest } from "@/lib/geo";

export function middleware(request: NextRequest) {
  const country = getCountryFromRequest(request);
  const response = NextResponse.next();

  if (country) {
    response.cookies.set("teret_country", country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
