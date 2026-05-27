"use client";

import { useEffect, useRef, useState } from "react";
import type { InsightsResponse, SolarPanel } from "@/lib/api";
import { mapsLoader } from "@/lib/maps-loader";

interface Props {
  center: { lat: number; lng: number };
  insights: InsightsResponse | null;
  panelLimit: number; // top-N panels by yearly energy
}

// Convert meters offset to a lat/lng delta — flat-earth approx is fine at building scale
function offsetLatLng(
  origin: google.maps.LatLngLiteral,
  dxMeters: number,
  dyMeters: number,
): google.maps.LatLngLiteral {
  const R = 6378137; // earth radius m
  const dLat = (dyMeters / R) * (180 / Math.PI);
  const dLng = ((dxMeters / R) * (180 / Math.PI)) / Math.cos((origin.lat * Math.PI) / 180);
  return { lat: origin.lat + dLat, lng: origin.lng + dLng };
}

function panelPolygonPath(
  panel: SolarPanel,
  width: number,
  height: number,
  azimuthDegrees: number,
): google.maps.LatLngLiteral[] {
  // Width/height in meters. Orientation rotates the rectangle 90° if PORTRAIT vs LANDSCAPE.
  const w = panel.orientation === "LANDSCAPE" ? width : height;
  const h = panel.orientation === "LANDSCAPE" ? height : width;
  const half = [
    { x: -w / 2, y: -h / 2 },
    { x: w / 2, y: -h / 2 },
    { x: w / 2, y: h / 2 },
    { x: -w / 2, y: h / 2 },
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

export function RoofMap({ center, insights, panelLimit }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  const svRef = useRef<HTMLDivElement>(null);
  const svPanorama = useRef<google.maps.StreetViewPanorama | null>(null);
  const svService = useRef<google.maps.StreetViewService | null>(null);
  const [svUnavailable, setSvUnavailable] = useState(false);

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

  // Redraw panels whenever insights or panel limit change
  useEffect(() => {
    if (!mapInstance.current) return;

    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];

    if (!insights || !insights.solarPanels || !insights.panelWidthMeters || !insights.panelHeightMeters) {
      return;
    }

    const sorted = [...insights.solarPanels].sort(
      (a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh,
    );
    const chosen = sorted.slice(0, panelLimit);

    chosen.forEach((panel) => {
      const seg = insights.roofSegmentStats?.[panel.segmentIndex];
      const azimuth = seg?.azimuthDegrees ?? 0;
      const path = panelPolygonPath(
        panel,
        insights.panelWidthMeters!,
        insights.panelHeightMeters!,
        azimuth,
      );
      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: "#1a1a1a",
        strokeOpacity: 0.9,
        strokeWeight: 0.6,
        fillColor: "#0b1d3a",
        fillOpacity: 0.85,
        map: mapInstance.current!,
        clickable: false,
      });
      polygonsRef.current.push(polygon);
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
    });
  }, []);

  // Update Street View on address change
  useEffect(() => {
    if (!svService.current || !svPanorama.current) return;
    setSvUnavailable(false);
    svService.current.getPanorama(
      {
        location: center,
        radius: 50,
        source: google.maps.StreetViewSource.OUTDOOR,
        preference: google.maps.StreetViewPreference.NEAREST,
      },
      (data, status) => {
        if (status !== google.maps.StreetViewStatus.OK || !data?.location?.latLng) {
          setSvUnavailable(true);
          return;
        }
        const panoLatLng = data.location.latLng.toJSON();
        const heading = computeHeading(panoLatLng, center);
        svPanorama.current!.setPosition(panoLatLng);
        svPanorama.current!.setPov({ heading, pitch: 5 });
        svPanorama.current!.setVisible(true);
      },
    );
  }, [center]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top half — satellite view with panel overlays */}
      <div ref={mapRef} className="flex-1 bg-fog" />

      {/* Bottom half — Street View */}
      <div className="relative flex-1 bg-ink">
        <div ref={svRef} className="w-full h-full" />
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
