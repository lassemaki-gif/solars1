import type { Metadata } from "next";
import type { MarketConfig } from "./market";
import {
  arMarket, atMarket, auMarket, beMarket, bgMarket, brMarket,
  caMarket, chMarket, clMarket, coMarket, cyMarket, czMarket,
  deMarket, dkMarket, eeMarket, esMarket, fiMarket, frMarket,
  gbMarket, grMarket, hkMarket, hrMarket, huMarket, idMarket, ieMarket, isMarket,
  itMarket, jpMarket, krMarket, ltMarket, luMarket, lvMarket, mtMarket, mxMarket,
  myMarket, nlMarket, noMarket, nzMarket, peMarket, phMarket, plMarket,
  prMarket, ptMarket, roMarket, seMarket, sgMarket, siMarket, skMarket,
  thMarket, twMarket, usMarket,
} from "./market";

const allMarkets: MarketConfig[] = [
  arMarket, atMarket, auMarket, beMarket, bgMarket, brMarket,
  caMarket, chMarket, clMarket, coMarket, cyMarket, czMarket,
  deMarket, dkMarket, eeMarket, esMarket, fiMarket, frMarket,
  gbMarket, grMarket, hkMarket, hrMarket, huMarket, idMarket, ieMarket, isMarket,
  itMarket, jpMarket, krMarket, ltMarket, luMarket, lvMarket, mtMarket, mxMarket,
  myMarket, nlMarket, noMarket, nzMarket, peMarket, phMarket, plMarket,
  prMarket, ptMarket, roMarket, seMarket, sgMarket, siMarket, skMarket,
  thMarket, twMarket, usMarket,
];

// Keyed by BCP-47 locale; x-default points to the hub (unsupported countries)
export const hreflangAlternates: Record<string, string> = {
  ...Object.fromEntries(
    allMarkets.map((m) => [m.locale, `https://solars.solutions/${m.id}`])
  ),
  "x-default": "https://solars.solutions",
};

const BASE = "https://solars.solutions";

export function marketMetadata(config: MarketConfig): Metadata {
  const title = `SoLars — ${config.edition}`;
  const description =
    config.t.body.length > 155
      ? config.t.body.slice(0, 152) + "..."
      : config.t.body;
  const ogImage = `${BASE}/api/og?id=${config.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "SoLars",
      locale: config.locale,
      type: "website",
      url: `${BASE}/${config.id}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${BASE}/${config.id}`,
      languages: hreflangAlternates,
    },
  };
}
