import type { MetadataRoute } from "next";
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
} from "@/lib/market";

const BASE = "https://solars.solutions";

const markets = [
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
