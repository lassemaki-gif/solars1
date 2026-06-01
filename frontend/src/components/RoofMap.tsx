"use client";

import { useEffect, useRef, useState } from "react";
import type { InsightsResponse, SolarPanel } from "@/lib/api";
import { mapsLoader } from "@/lib/maps-loader";

interface Props {
  center: { lat: number; lng: number };
  insights: InsightsResponse | null;
  panelLimit: number;
}

// zoom is valid at runtime but omitted from some @types/google.maps versions
type Pov = google.maps.StreetViewPov & { zoom?: number };

interface PanelScreenData {
  corners: [[number, number], [number, number], [number, number], [number, number]];
}


const R_EARTH = 6378137;

function offsetLatLng(
  origin: google.maps.LatLngLiteral,
  dxMeters: number,
  dyMeters: number,
): google.maps.LatLngLiteral {
  const dLat = (dyMeters / R_EARTH) * (180 / Math.PI);
  const dLng = ((dxMeters / R_EARTH) * (180 / Math.PI)) / Math.cos((origin.lat * Math.PI) / 180);
  return { lat: origin.lat + dLat, lng: origin.lng + dLng };
}

function panelPolygonPath(
  panel: SolarPanel,
  width: number,
  height: number,
  azimuthDegrees: number,
): google.maps.LatLngLiteral[] {
  const w = panel.orientation === "LANDSCAPE" ? width : height;
  const h = panel.orientation === "LANDSCAPE" ? height : width;
  const half = [
    { x: -w / 2, y: -h / 2 },
    { x:  w / 2, y: -h / 2 },
    { x:  w / 2, y:  h / 2 },
    { x: -w / 2, y:  h / 2 },
  ];
  const theta = (azimuthDegrees * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return half.map(({ x, y }) => {
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return offsetLatLng({ lat: panel.center.latitude, lng: panel.center.longitude }, rx, ry);
  });
}

function computeHeading(
  from: google.maps.LatLngLiteral,
  to: google.maps.LatLngLiteral,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

// Project all panels into Street View screen space.
function projectPanels(
  panels: SolarPanel[],
  panelLimit: number,
  insights: InsightsResponse,
  panoPos: google.maps.LatLngLiteral,
  pov: Pov,
  vpW: number,
  vpH: number,
  terrainElevation = 0,
): PanelScreenData[] {
  if (!insights.panelWidthMeters || !insights.panelHeightMeters) return [];

  const H = (pov.heading * Math.PI) / 180;
  const P = (pov.pitch   * Math.PI) / 180;
  const halfFovH = Math.PI / Math.pow(2, (pov.zoom ?? 1) + 1);
  const halfFovV = Math.atan(Math.tan(halfFovH) * (vpH / vpW));
  // planeHeightAtCenterMeters is MSL elevation; terrainElevation (also MSL) corrects for that.
  // If elevation API failed (sentinel -1), estimate ground from the lowest roof segment
  // minus a typical Finnish residential eave height (5 m).
  const minPlaneH = insights.roofSegmentStats?.length
    ? Math.min(...insights.roofSegmentStats.map(s => s.planeHeightAtCenterMeters ?? 999))
    : 999;
  const effectiveTerrain = terrainElevation >= 0 ? terrainElevation : minPlaneH - 5;
  const CAM_H = effectiveTerrain + 1.5;

  const chosen = [...panels]
    .sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh)
    .slice(0, panelLimit);

  const result: PanelScreenData[] = [];

  for (const panel of chosen) {
    const seg     = insights.roofSegmentStats?.[panel.segmentIndex];
    const pH      = seg?.planeHeightAtCenterMeters ?? 5;
    const corners = panelPolygonPath(panel, insights.panelWidthMeters!, insights.panelHeightMeters!, seg?.azimuthDegrees ?? 0);
    const sc: [number, number][] = [];
    let ok = true;

    for (const c of corners) {
      const north = (c.lat - panoPos.lat) * R_EARTH * (Math.PI / 180);
      const east  = (c.lng - panoPos.lng) * R_EARTH * (Math.PI / 180) * Math.cos(panoPos.lat * Math.PI / 180);

      // Per-corner height: adjust pH by position along the slope
      let cornerH = pH;
      if (seg?.center && seg.pitchDegrees != null && seg.azimuthDegrees != null) {
        const az  = seg.azimuthDegrees * Math.PI / 180;
        const pit = seg.pitchDegrees   * Math.PI / 180;
        const cN  = (c.lat - seg.center.latitude)  * R_EARTH * Math.PI / 180;
        const cE  = (c.lng - seg.center.longitude) * R_EARTH * Math.PI / 180
          * Math.cos(seg.center.latitude * Math.PI / 180);
        // downhill projection: positive = toward azimuth direction = lower elevation
        const downhill = cE * Math.sin(az) + cN * Math.cos(az);
        const raw = pH - downhill * Math.tan(pit);
        // Cap correction to ±6 m so stale/wrong segment centres don't fling panels off-screen
        cornerH = Math.max(pH - 6, Math.min(pH + 6, raw));
      }
      const up = cornerH - CAM_H;
      const fwd   =  east * Math.sin(H) * Math.cos(P) + north * Math.cos(H) * Math.cos(P) + up * Math.sin(P);
      const right =  east * Math.cos(H) - north * Math.sin(H);
      const camUp = -east * Math.sin(H) * Math.sin(P) - north * Math.cos(H) * Math.sin(P) + up * Math.cos(P);

      if (fwd <= 0.5) { ok = false; break; }
      sc.push([
        (( right / (fwd * Math.tan(halfFovH)) + 1) / 2) * vpW,
        ((1 - camUp / (fwd * Math.tan(halfFovV))) / 2) * vpH,
      ]);
    }

    if (!ok || sc.length !== 4) continue;
    const m = 300;
    if (!sc.some(([x, y]) => x > -m && x < vpW + m && y > -m && y < vpH + m)) continue;
    result.push({ corners: sc as PanelScreenData["corners"] });
  }
  return result;
}

// Renders one solar panel in SVG space.
function SvPanel({ corners, index }: { corners: PanelScreenData["corners"]; index: number }) {
  const pts   = corners.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const gradId = `sv-pg-${index}`;
  const [x1, y1] = corners[0];
  const [x2, y2] = corners[2];

  return (
    <g>
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse"
          x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)}>
          <stop offset="0%"   stopColor="#7ab0e0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000820" stopOpacity="0.00" />
        </linearGradient>
      </defs>
      <polygon points={pts} fill="#0c1a28" fillOpacity={0.92} />
      <polygon points={pts} fill={`url(#${gradId})`} />
      <polygon points={pts} fill="none" stroke="#a8b0b8" strokeWidth={1.4} strokeOpacity={0.85} />
    </g>
  );
}



export function RoofMap({ center, insights, panelLimit }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  const svRef = useRef<HTMLDivElement>(null);
  const svPanorama = useRef<google.maps.StreetViewPanorama | null>(null);
  const svService = useRef<google.maps.StreetViewService | null>(null);

  // Stores panorama position + terrain elevation (MSL) for panel projection
  const capturedPovRef = useRef<{ pos: google.maps.LatLngLiteral; pov: Pov; terrainElevation: number } | null>(null);
  // Tracks the lat/lng for which Gemini was last triggered — prevents re-generation on slider moves
  const geminiGeneratedFor = useRef<{ lat: number; lng: number } | null>(null);

  const [svUnavailable, setSvUnavailable] = useState(false);
  const [svReady, setSvReady]   = useState(false);
  const [panoReady, setPanoReady] = useState(false);
  const [svPanels, setSvPanels] = useState<PanelScreenData[]>([]);
  const [geminiImage, setGeminiImage] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // ── Satellite map ──────────────────────────────────────────────────────────

  useEffect(() => {
    mapsLoader.importLibrary("maps").then((maps) => {
      if (!mapRef.current || mapInstance.current) return;
      mapInstance.current = new maps.Map(mapRef.current, {
        center, zoom: 20, mapTypeId: "satellite",
        tilt: 0, disableDefaultUI: true, zoomControl: true, gestureHandling: "greedy",
      });
    });
  }, [center]);

  useEffect(() => { mapInstance.current?.panTo(center); }, [center]);

  useEffect(() => {
    if (!mapInstance.current) return;
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];
    if (!insights?.solarPanels || !insights.panelWidthMeters || !insights.panelHeightMeters) return;

    [...insights.solarPanels]
      .sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh)
      .slice(0, panelLimit)
      .forEach((panel) => {
        const seg = insights.roofSegmentStats?.[panel.segmentIndex];
        const path = panelPolygonPath(panel, insights.panelWidthMeters!, insights.panelHeightMeters!, seg?.azimuthDegrees ?? 0);
        polygonsRef.current.push(new google.maps.Polygon({
          paths: path,
          strokeColor: "#1a1a1a", strokeOpacity: 0.9, strokeWeight: 0.6,
          fillColor: "#0b1d3a", fillOpacity: 0.85,
          map: mapInstance.current!, clickable: false,
        }));
      });
  }, [insights, panelLimit]);

  // ── Street View init ───────────────────────────────────────────────────────

  useEffect(() => {
    mapsLoader.importLibrary("streetView").then((sv) => {
      if (!svRef.current || svPanorama.current) return;
      svService.current = new sv.StreetViewService();
      svPanorama.current = new sv.StreetViewPanorama(svRef.current, {
        disableDefaultUI: true,
        motionTracking: false, motionTrackingControl: false,
        linksControl: false, panControl: false,
        zoomControl: false, addressControl: false, fullscreenControl: false,
      });
      setSvReady(true);
    });
  }, []);

  // ── Street View position update ────────────────────────────────────────────

  useEffect(() => {
    if (!svService.current || !svPanorama.current) return;
    setSvUnavailable(false);
    setSvPanels([]);
    setPanoReady(false);
    capturedPovRef.current = null;

    svService.current.getPanorama(
      { location: center, radius: 50, source: google.maps.StreetViewSource.OUTDOOR, preference: google.maps.StreetViewPreference.NEAREST },
      (data, status) => {
        if (status !== google.maps.StreetViewStatus.OK || !data?.location?.latLng) {
          setSvUnavailable(true);
          return;
        }
        const pos = data.location.latLng.toJSON();
        const heading = computeHeading(pos, center);
        const pov: Pov = { heading, pitch: 0, zoom: 0.5 };

        svPanorama.current!.setPosition(pos);
        svPanorama.current!.setPov(pov);
        svPanorama.current!.setVisible(true);

        // Fetch terrain elevation so we can convert planeHeightAtCenterMeters
        // (MSL) into height above the Street View camera.
        // google.maps.ElevationService is available as soon as any library has loaded.
        try {
          new google.maps.ElevationService().getElevationForLocations(
            { locations: [pos] },
            (results, status) => {
              const elev = status === "OK" && results?.[0] ? results[0].elevation : null;
              capturedPovRef.current = { pos, pov, terrainElevation: elev ?? -1 };
              setPanoReady(true);
            },
          );
        } catch (e) {
          console.warn("[RoofMap] ElevationService unavailable:", e);
          capturedPovRef.current = { pos, pov, terrainElevation: -1 };
          setPanoReady(true);
        }
      },
    );
  }, [center]);

  // ── Live Street View panel overlay ────────────────────────────────────────

  useEffect(() => {
    if (!svReady || !panoReady || !svPanorama.current || !svRef.current) return;
    if (!insights?.solarPanels || !insights.panelWidthMeters || !insights.panelHeightMeters) {
      setSvPanels([]);
      return;
    }

    // Snapshot viewport dimensions now — clientWidth transiently returns 0
    // inside pov_changed callbacks after React re-renders the overlay SVG.
    const vpW = svRef.current.clientWidth  || 640;
    const vpH = svRef.current.clientHeight || 360;

    // Live overlay: reproject on every camera move
    const reproject = () => {
      if (!svPanorama.current || !capturedPovRef.current) return;
      const pos = svPanorama.current.getPosition();
      if (!pos) return;
      setSvPanels(projectPanels(
        insights.solarPanels!, panelLimit, insights,
        pos.toJSON(), svPanorama.current.getPov() as Pov,
        vpW, vpH,
        capturedPovRef.current.terrainElevation,
      ));
    };

    const listeners = [
      svPanorama.current.addListener("pov_changed",      reproject),
      svPanorama.current.addListener("position_changed", reproject),
    ];
    reproject();

    return () => { listeners.forEach((l) => google.maps.event.removeListener(l)); };
  }, [svReady, panoReady, center, insights, panelLimit]);

  // ── Gemini AI solar visualisation ─────────────────────────────────────────

  useEffect(() => {
    // center prop is a new object on every parent render (slider moves etc.) —
    // compare lat/lng values so we only generate once per actual address change.
    const alreadyGenerated =
      geminiGeneratedFor.current?.lat === center.lat &&
      geminiGeneratedFor.current?.lng === center.lng;
    if (alreadyGenerated) return;

    // New address — reset state
    setGeminiImage(null);
    setGeminiError(null);

    if (!panoReady || svUnavailable || !capturedPovRef.current) return;

    // Mark this address as in-progress so subsequent effect firings skip it
    geminiGeneratedFor.current = { lat: center.lat, lng: center.lng };

    const { pos, pov } = capturedPovRef.current;
    const heading = ((pov.heading % 360) + 360) % 360;
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
    const imageUrl =
      `https://maps.googleapis.com/maps/api/streetview` +
      `?size=640x360&location=${pos.lat},${pos.lng}` +
      `&heading=${heading.toFixed(2)}&pitch=0&fov=120&key=${key}`;

    setGeminiLoading(true);

    fetch("/api/solar-viz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? `HTTP ${r.status}`);
        return json as { imageData?: string; mimeType?: string };
      })
      .then(({ imageData, mimeType }) => {
        if (imageData) setGeminiImage(`data:${mimeType ?? "image/png"};base64,${imageData}`);
      })
      .catch((e: Error) => setGeminiError(e.message))
      .finally(() => setGeminiLoading(false));
  }, [panoReady, svUnavailable, center]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full flex flex-col">

      {/* 1 — Satellite view with panel polygons */}
      <div ref={mapRef} className="flex-1 bg-fog" />

      {/* 2 — Live Street View with real-time panel overlay */}
      <div className="relative flex-1 bg-ink">
        <div ref={svRef} className="w-full h-full" />

        {svPanels.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {svPanels.map((p, i) => <SvPanel key={i} corners={p.corners} index={i} />)}
          </svg>
        )}

        {svUnavailable && (
          <div className="absolute inset-0 grid place-items-center bg-ink text-paper">
            <div className="text-center px-6">
              <p className="text-xs uppercase tracking-widest text-ash mb-2">Street View</p>
              <p className="font-display text-xl">Not available</p>
              <p className="mt-2 text-sm text-ash">No street-level imagery for this address.</p>
            </div>
          </div>
        )}
      </div>

      {/* 3 — Gemini AI solar visualisation */}
      {!svUnavailable && (
        <div className="relative flex-1 bg-ink overflow-hidden">
          {geminiImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={geminiImage} alt="AI solar visualisation" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-paper">
              <div className="text-center space-y-3 px-6">
                {geminiLoading && (
                  <div className="w-6 h-6 border-2 border-paper/30 border-t-paper rounded-full animate-spin mx-auto" />
                )}
                <p className="text-xs uppercase tracking-widest">
                  {geminiError
                    ? geminiError
                    : geminiLoading
                    ? "Generating AI visualisation…"
                    : "Waiting for Street View…"}
                </p>
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-paper/95 border border-ink/20 px-4 py-2 mono text-xs">
            <div className="uppercase tracking-widest text-ash">AI Visualisation</div>
            <div className="font-sans text-ash">Gemini · solar panels</div>
          </div>
        </div>
      )}

    </div>
  );
}
