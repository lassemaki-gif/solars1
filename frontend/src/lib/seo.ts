import type { Metadata } from "next";
import type { MarketConfig } from "./market";
import {
  atMarket, beMarket, bgMarket, chMarket, cyMarket, czMarket,
  deMarket, dkMarket, eeMarket, esMarket, fiMarket, frMarket,
  gbMarket, grMarket, hrMarket, huMarket, ieMarket, isMarket,
  itMarket, ltMarket, luMarket, lvMarket, mtMarket, nlMarket,
  noMarket, plMarket, ptMarket, roMarket, seMarket, siMarket, skMarket,
} from "./market";

const allMarkets: MarketConfig[] = [
  atMarket, beMarket, bgMarket, chMarket, cyMarket, czMarket,
  deMarket, dkMarket, eeMarket, esMarket, fiMarket, frMarket,
  gbMarket, grMarket, hrMarket, huMarket, ieMarket, isMarket,
  itMarket, ltMarket, luMarket, lvMarket, mtMarket, nlMarket,
  noMarket, plMarket, ptMarket, roMarket, seMarket, siMarket, skMarket,
];

// Keyed by BCP-47 locale; x-default points to the hub (unsupported countries)
export const hreflangAlternates: Record<string, string> = {
  ...Object.fromEntries(
    allMarkets.map((m) => [m.locale, `https://solars.solutions/${m.id}`])
  ),
  "x-default": "https://solars.solutions",
};

export function marketMetadata(config: MarketConfig): Metadata {
  const title = `SoLars — ${config.edition}`;
  const description =
    config.t.body.length > 155
      ? config.t.body.slice(0, 152) + "..."
      : config.t.body;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "SoLars",
      locale: config.locale,
      type: "website",
      url: `https://solars.solutions/${config.id}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://solars.solutions/${config.id}`,
      languages: hreflangAlternates,
    },
  };
}
