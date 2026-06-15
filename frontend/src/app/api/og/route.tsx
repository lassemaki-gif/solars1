import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
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
import type { MarketConfig } from "@/lib/market";

export const runtime = "edge";

const markets: Record<string, MarketConfig> = {
  ar: arMarket, at: atMarket, au: auMarket, be: beMarket, bg: bgMarket, br: brMarket,
  ca: caMarket, ch: chMarket, cl: clMarket, co: coMarket, cy: cyMarket, cz: czMarket,
  de: deMarket, dk: dkMarket, ee: eeMarket, es: esMarket, fi: fiMarket, fr: frMarket,
  gb: gbMarket, gr: grMarket, hk: hkMarket, hr: hrMarket, hu: huMarket, id: idMarket,
  ie: ieMarket, is: isMarket, it: itMarket, jp: jpMarket, kr: krMarket, lt: ltMarket,
  lu: luMarket, lv: lvMarket, mt: mtMarket, mx: mxMarket, my: myMarket, nl: nlMarket,
  no: noMarket, nz: nzMarket, pe: peMarket, ph: phMarket, pl: plMarket, pr: prMarket,
  pt: ptMarket, ro: roMarket, se: seMarket, sg: sgMarket, si: siMarket, sk: skMarket,
  th: thMarket, tw: twMarket, us: usMarket,
};

async function loadFont(name: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@${weight}&display=swap`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; OgImageBot/1.0)" } }
    ).then((r) => r.text());
    const url = /src: url\(([^)]+)\)/.exec(css)?.[1];
    if (!url) return null;
    return fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const market = markets[id] ?? null;

  const [frauncesLight, interTight] = await Promise.all([
    loadFont("Fraunces", 300),
    loadFont("Inter Tight", 500),
  ]);

  type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  const fonts: { name: string; data: ArrayBuffer; weight: Weight; style: "normal" | "italic" }[] = [];
  if (frauncesLight) fonts.push({ name: "Fraunces", data: frauncesLight, weight: 300 as Weight, style: "normal" });
  if (interTight) fonts.push({ name: "Inter Tight", data: interTight, weight: 500 as Weight, style: "normal" });

  const countryName = market ? market.countryNameEn : null;
  const price = market
    ? `${market.currencySymbol}${market.defaults.electricityPrice % 1 === 0
        ? market.defaults.electricityPrice.toFixed(0)
        : market.defaults.electricityPrice < 10
        ? market.defaults.electricityPrice.toFixed(2)
        : market.defaults.electricityPrice.toFixed(0)}/kWh`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#1a1a1a",
          padding: "56px 72px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Inter Tight', sans-serif",
        }}
      >
        {/* Sun orb — top-right */}
        <div style={{ position: "absolute", top: -120, right: -120, width: 560, height: 560, borderRadius: "50%", background: "#e3611d", opacity: 0.08, display: "flex" }} />
        <div style={{ position: "absolute", top: -60, right: -60, width: 380, height: 380, borderRadius: "50%", background: "#e3611d", opacity: 0.12, display: "flex" }} />
        <div style={{ position: "absolute", top: 20, right: 20, width: 220, height: 220, borderRadius: "50%", background: "#e3611d", opacity: 0.18, display: "flex" }} />
        <div style={{ position: "absolute", top: 80, right: 80, width: 100, height: 100, borderRadius: "50%", background: "#e3611d", opacity: 0.9, display: "flex" }} />

        {/* Horizon line */}
        <div style={{ position: "absolute", bottom: 140, left: 0, right: 0, height: 1, background: "#f7f4ee", opacity: 0.06, display: "flex" }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", zIndex: 1 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ color: "#f7f4ee", fontSize: 26, fontWeight: 500, letterSpacing: "-0.01em", fontFamily: "'Inter Tight', sans-serif" }}>
              SoLars
            </span>
            <span style={{ color: "#e3611d", fontSize: 26, fontWeight: 500 }}>.</span>
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ color: "#5c5b58", fontSize: 20, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter Tight', sans-serif" }}>
              {countryName ? "Solar savings calculator" : "Solar savings calculator"}
            </div>
            <div
              style={{
                color: "#f7f4ee",
                fontSize: countryName && countryName.length > 14 ? 66 : 80,
                fontWeight: 300,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                fontFamily: "'Fraunces', Georgia, serif",
              }}
            >
              {countryName
                ? `${countryName}.`
                : "Where is\nyour roof?"}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {price && (
              <>
                <span style={{ color: "#e3611d", fontSize: 28, fontWeight: 500, fontFamily: "monospace", letterSpacing: "-0.01em" }}>
                  {price}
                </span>
                <span style={{ color: "#5c5b58", fontSize: 16, opacity: 0.6 }}>·</span>
              </>
            )}
            <span style={{ color: "#5c5b58", fontSize: 16, letterSpacing: "0.04em" }}>
              Satellite roof analysis · Local tariffs · Certified installers
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}
