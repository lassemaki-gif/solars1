import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const countryRoutes: Record<string, string> = {
  AT: "/at", BE: "/be", BG: "/bg", HR: "/hr", CY: "/cy",
  CZ: "/cz", DK: "/dk", EE: "/ee", FI: "/fi", FR: "/fr",
  DE: "/de", GR: "/gr", HU: "/hu", IE: "/ie", IT: "/it",
  LV: "/lv", LT: "/lt", LU: "/lu", MT: "/mt", NL: "/nl",
  PL: "/pl", PT: "/pt", RO: "/ro", SK: "/sk", SI: "/si",
  ES: "/es", SE: "/se", GB: "/gb", CH: "/ch", NO: "/no",
  IS: "/is",
};

export function middleware(request: NextRequest) {
  if (request.nextUrl.searchParams.has("all")) {
    return NextResponse.next();
  }

  const country =
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-vercel-ip-country");

  const route = country ? countryRoutes[country.toUpperCase()] : undefined;
  if (route) {
    const dest = new URL(route, request.url);
    // Preserve UTM params and any other query params through the redirect
    request.nextUrl.searchParams.forEach((value, key) => {
      dest.searchParams.set(key, value);
    });
    return NextResponse.redirect(dest);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
