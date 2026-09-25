import type { Metadata } from "next";
import type { MarketConfig } from "./market";
import {
  agMarket, alMarket, arMarket, atMarket, auMarket, beMarket, bgMarket, brMarket,
  bsMarket, caMarket, chMarket, clMarket, coMarket, cyMarket, czMarket,
  deMarket, dkMarket, eeMarket, esMarket, fiMarket, frMarket,
  gbMarket, grMarket, hkMarket, hrMarket, huMarket, idMarket, ieMarket,
  inMarket, inBnMarket, inGuMarket, inHiMarket, inKnMarket, inMlMarket,
  inMrMarket, inOrMarket, inPaMarket, inTaMarket, inTeMarket,
  isMarket, itMarket, jpMarket, krMarket, ltMarket, luMarket, lvMarket,
  mcMarket, mtMarket, mxMarket, myMarket, moMarket, nlMarket, noMarket,
  nzMarket, peMarket, phMarket, pkMarket, plMarket,
  prMarket, ptMarket, roMarket, rsMarket, seMarket, sgMarket, siMarket, skMarket, smMarket,
  thMarket, twMarket, usMarket,
} from "./market";

const allMarkets: MarketConfig[] = [
  agMarket, alMarket, arMarket, atMarket, auMarket, beMarket, bgMarket, brMarket,
  bsMarket, caMarket, chMarket, clMarket, coMarket, cyMarket, czMarket,
  deMarket, dkMarket, eeMarket, esMarket, fiMarket, frMarket,
  gbMarket, grMarket, hkMarket, hrMarket, huMarket, idMarket, ieMarket,
  inMarket, inBnMarket, inGuMarket, inHiMarket, inKnMarket, inMlMarket,
  inMrMarket, inOrMarket, inPaMarket, inTaMarket, inTeMarket,
  isMarket, itMarket, jpMarket, krMarket, ltMarket, luMarket, lvMarket,
  mcMarket, mtMarket, mxMarket, myMarket, moMarket, nlMarket, noMarket,
  nzMarket, peMarket, phMarket, pkMarket, plMarket,
  prMarket, ptMarket, roMarket, rsMarket, seMarket, sgMarket, siMarket, skMarket, smMarket,
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
