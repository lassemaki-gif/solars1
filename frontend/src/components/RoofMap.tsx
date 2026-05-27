"use client";

import { useEffect, useRef, useState } from "react";
import type { InsightsResponse, SolarPanel } from "@/lib/api";
import { mapsLoader } from "@/lib/maps-loader";

interface Props {
  center: { lat: number; lng: number };
  insights: InsightsResponse | null;
  panelLimit: number; // top-N panels by yearly energy
}

const R_EARTH = 6378137; // metres

// Convert meters offset to a lat/lng delta — flat-earth approx is fine at building scale
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

/**
 * Project panel corners onto the Street View viewport using perspective math.
 *
 * Coordinate system: East-North-Up (ENU) relative to the panorama position.
 * Camera axes derived from heading (H) and pitch (P):
 *   forward = (sin H cos P,  cos H cos P,  sin P)
 *   right   = (cos H,       -sin H,        0    )
 *   up      = (-sin H sin P, -cos H sin P, cos P )
 *
 * Horizontal FOV at zoom z: 180° / 2^z  (zoom 0 = 180°, zoom 1 = 90°, etc.)
 */
function projectPanelsToSV(
  panels: SolarPanel[],
  panelLimit: number,
  insights: InsightsResponse,
  panoPos: google.maps.LatLngLiteral,
  pov: google.maps.StreetViewPov,
  vpW: number,
  vpH: number,
): string[] {
  if (!insights.panelWidthMeters || !insights.panelHeightMeters) return [];

  const H = (pov.heading * Math.PI) / 180;
  const P = (pov.pitch  * Math.PI) / 180;
  const zoom = pov.zoom ?? 1;

  // Half-angle of horizontal FOV in radians
  const halfFovH = (Math.PI / Math.pow(2, zoom + 1));
  const halfFovV = Math.atan(Math.tan(halfFovH) * (vpH / vpW));

  const CAM_HEIGHT = 1.5; // approximate Street View camera height above ground (m)

  const sorted = [...panels].sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh);
  const chosen = sorted.slice(0, panelLimit);

  const result: string[] = [];

  for (const panel of chosen) {
    const seg = insights.roofSegmentStats?.[panel.segmentIndex];
    const panelHeight = seg?.planeHeightAtCenterMeters ?? 5;
    const azimuth = seg?.azimuthDegrees ?? 0;
    const corners = panelPolygonPath(panel, insights.panelWidthMeters!, insights.panelHeightMeters!, azimuth);

    const screenPts: string[] = [];
    let valid = true;

    for (const corner of corners) {
      // ENU offset from panorama to corner
      const dLat = corner.lat - panoPos.lat;
      const dLng = corner.lng - panoPos.lng;
      const north = dLat * R_EARTH * (Math.PI / 180);
      const east  = dLng * R_EARTH * (Math.PI / 180) * Math.cos(panoPos.lat * Math.PI / 180);
      const up    = panelHeight - CAM_HEIGHT;

      // Project onto camera axes
      const fwd   =  east * Math.sin(H) * Math.cos(P) + north * Math.cos(H) * Math.cos(P) + up * Math.sin(P);
      const right =  east * Math.cos(H) - north * Math.sin(H);
      const camUp = -east * Math.sin(H) * Math.sin(P) - north * Math.cos(H) * Math.sin(P) + up * Math.cos(P);

      if (fwd <= 0.5) { valid = false; break; } // behind or too close to camera

      // Perspective divide → NDC [-1, 1]
      const ndcX =  right / (fwd * Math.tan(halfFovH));
      const ndcY = camUp  / (fwd * Math.tan(halfFovV));

      // NDC → screen pixels (Y flipped: SVG Y increases downward)
      const sx = ((ndcX + 1) / 2) * vpW;
      const sy = ((1 - ndcY) / 2) * vpH;
      screenPts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }

    if (!valid) continue;

    // Skip panels entirely outside the viewport (with margin for partially visible ones)
    const margin = 300;
    const pts = screenPts.map((s) => s.split(",").map(Number) as [number, number]);
    const anyVisible = pts.some(([x, y]) =>
      x > -margin && x < vpW + margin && y > -margin && y < vpH + margin
    );
    if (!anyVisible) continue;

    result.push(screenPts.join(" "));
  }

  return result;
}

export function RoofMap({ center, insights, panelLimit }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  const svRef = useRef<HTMLDivElement>(null);
  const svPanorama = useRef<google.maps.StreetViewPanorama | null>(null);
  const svService = useRef<google.maps.StreetViewService | null>(null);
  const [svUnavailable, setSvUnavailable] = useState(false);
  const [svReady, setSvReady] = useState(false);
  const [svPanelPolygons, setSvPanelPolygons] = useState<string[]>([]);

  // Init satellite map once
  useEffect(() => {
    mapsLoader.importLibrary("maps").then((maps) => {
      if (!mapRef.current || mapInstance.current) return;
      mapInstance.current = new maps.Map(mapRef.current, {
        center,
        zoom: 20,
        mapTypeId: "satellite",
        tilt: 0,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "greedy",
      });
    });
  }, [center]);

  // Recenter satellite on address change
  useEffect(() => {
    mapInstance.current?.panTo(center);
  }, [center]);

  // Redraw satellite panel polygons
  useEffect(() => {
    if (!mapInstance.current) return;
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];
    if (!insights?.solarPanels || !insights.panelWidthMeters || !insights.panelHeightMeters) return;

    const sorted = [...insights.solarPanels].sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh);
    sorted.slice(0, panelLimit).forEach((panel) => {
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

  // Init Street View once
  useEffect(() => {
    mapsLoader.importLibrary("streetView").then((sv) => {
      if (!svRef.current || svPanorama.current) return;
      svService.current = new sv.StreetViewService();
      svPanorama.current = new sv.StreetViewPanorama(svRef.current, {
        disableDefaultUI: true,
        motionTracking: false,
        motionTrackingControl: false,
        linksControl: false,
        panControl: false,
        zoomControl: false,
        addressControl: false,
        fullscreenControl: false,
      });
      setSvReady(true);
    });
  }, []);

  // Update Street View position on address change
  useEffect(() => {
    if (!svService.current || !svPanorama.current) return;
    setSvUnavailable(false);
    setSvPanelPolygons([]);
    svService.current.getPanorama(
      { location: center, radius: 50, source: google.maps.StreetViewSource.OUTDOOR, preference: google.maps.StreetViewPreference.NEAREST },
      (data, status) => {
        if (status !== google.maps.StreetViewStatus.OK || !data?.location?.latLng) {
          setSvUnavailable(true);
          return;
        }
        const panoLatLng = data.location.latLng.toJSON();
        svPanorama.current!.setPosition(panoLatLng);
        svPanorama.current!.setPov({ heading: computeHeading(panoLatLng, center), pitch: 5 });
        svPanorama.current!.setVisible(true);
      },
    );
  }, [center]);

  // Project panels onto Street View — re-runs on pov_changed / position_changed
  useEffect(() => {
    if (!svReady || !svPanorama.current || !svRef.current) return;
    if (!insights?.solarPanels || !insights.panelWidthMeters || !insights.panelHeightMeters) {
      setSvPanelPolygons([]);
      return;
    }

    const reproject = () => {
      if (!svPanorama.current || !svRef.current) return;
      const pos = svPanorama.current.getPosition();
      if (!pos) return;
      setSvPanelPolygons(
        projectPanelsToSV(
          insights.solarPanels!,
          panelLimit,
          insights,
          pos.toJSON(),
          svPanorama.current.getPov(),
          svRef.current.clientWidth,
          svRef.current.clientHeight,
        )
      );
    };

    const listeners = [
      svPanorama.current.addListener("pov_changed", reproject),
      svPanorama.current.addListener("position_changed", reproject),
    ];
    reproject();

    return () => {
      listeners.forEach((l) => google.maps.event.removeListener(l));
    };
  }, [svReady, center, insights, panelLimit]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top half — satellite view with panel overlays */}
      <div ref={mapRef} className="flex-1 bg-fog" />

      {/* Bottom half — Street View + projected panel SVG overlay */}
      <div className="relative flex-1 bg-ink">
        <div ref={svRef} className="w-full h-full" />

        {svPanelPolygons.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {svPanelPolygons.map((pts, i) => (
              <polygon
                key={i}
                points={pts}
                fill="#0b1d3a"
                fillOpacity={0.75}
                stroke="#f7f4ee"
                strokeWidth={0.8}
                strokeOpacity={0.9}
              />
            ))}
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
    </div>
  );
}
