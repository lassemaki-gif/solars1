"use client";

import { useEffect, useRef } from "react";
import type { InsightsResponse, SolarPanel } from "@/lib/api";
import { mapsLoader } from "@/lib/maps-loader";

interface Props {
  center: { lat: number; lng: number };
  insights: InsightsResponse | null;
  panelLimit: number;
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

export function RoofMap({ center, insights, panelLimit }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

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

  return <div ref={mapRef} className="w-full h-full bg-fog" />;
}
