import type { MetadataRoute } from "next";
import {
  arMarket, atMarket, auMarket, beMarket, bgMarket, brMarket,
  caMarket, chMarket, clMarket, coMarket, cyMarket, czMarket,
  deMarket, dkMarket, eeMarket, esMarket, fiMarket, frMarket,
  gbMarket, grMarket, hkMarket, hrMarket, huMarket, idMarket, ieMarket, isMarket,
  itMarket, jpMarket, krMarket, ltMarket, luMarket, lvMarket, mtMarket, mxMarket,
  myMarket, nlMarket, noMarket, nzMarket, peMarket, phMarket, plMarket,
  prMarket, ptMarket, roMarket, seMarket, sgMarket, siMarket, skMarket,
  thMarket, twMarket, usMarket,
} from "@/lib/market";

const BASE = "https://solars.solutions";

const markets = [
  arMarket, atMarket, auMarket, beMarket, bgMarket, brMarket,
  caMarket, chMarket, clMarket, coMarket, cyMarket, czMarket,
  deMarket, dkMarket, eeMarket, esMarket, fiMarket, frMarket,
  gbMarket, grMarket, hkMarket, hrMarket, huMarket, idMarket, ieMarket, isMarket,
  itMarket, jpMarket, krMarket, ltMarket, luMarket, lvMarket, mtMarket, mxMarket,
  myMarket, nlMarket, noMarket, nzMarket, peMarket, phMarket, plMarket,
  prMarket, ptMarket, roMarket, seMarket, sgMarket, siMarket, skMarket,
  thMarket, twMarket, usMarket,
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...markets.map((m) => ({
      url: `${BASE}/${m.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
