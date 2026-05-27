"""Wrapper around Google Solar API buildingInsights endpoint.

Why this exists as its own module:
  - Hides the API key from the frontend
  - Lets us cache aggressively (Solar API has a 10k/month free tier and is
    pay-as-you-go after; building geometry rarely changes between calls)
  - Centralizes error handling for NOT_FOUND (no coverage) and low-quality cases
"""
from __future__ import annotations

import json
from typing import Optional

import httpx
from sqlalchemy import select

from .config import settings
from .db import CachedInsight, async_session


SOLAR_API_URL = "https://solar.googleapis.com/v1/buildingInsights:findClosest"


def _cache_key(lat: float, lng: float) -> str:
    # ~11m resolution at the equator — enough to dedupe revisits to the same house
    return f"{round(lat, 5):.5f},{round(lng, 5):.5f}"


class SolarAPIError(Exception):
    """Raised when the Solar API returns an error or no coverage."""

    def __init__(self, message: str, *, status: int = 502, code: str = "solar_api_error"):
        super().__init__(message)
        self.status = status
        self.code = code


async def fetch_building_insights(
    lat: float, lng: float, *, required_quality: str = "MEDIUM"
) -> dict:
    """Fetch insights for a location, with DB caching.

    `required_quality` is one of HIGH, MEDIUM, BASE — we default to MEDIUM
    so the Nordics get coverage where HIGH-altitude flights are sparse.
    """
    key = _cache_key(lat, lng)

    # 1. Check cache
    async with async_session() as session:
        result = await session.execute(
            select(CachedInsight).where(CachedInsight.cache_key == key)
        )
        cached = result.scalar_one_or_none()
        if cached is not None:
            return json.loads(cached.payload)

    # 2. Miss — call Solar API
    if not settings.google_maps_api_key:
        raise SolarAPIError("Google Maps API key not configured", status=500, code="no_api_key")

    params = {
        "location.latitude": lat,
        "location.longitude": lng,
        "requiredQuality": required_quality,
        "key": settings.google_maps_api_key,
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get(SOLAR_API_URL, params=params)

    if resp.status_code == 404:
        raise SolarAPIError(
            "No solar data available for this address yet.",
            status=404,
            code="no_coverage",
        )
    if resp.status_code != 200:
        raise SolarAPIError(
            f"Solar API returned {resp.status_code}: {resp.text[:200]}",
            status=502,
        )

    data = resp.json()

    # 3. Store in cache
    imagery_quality = data.get("imageryQuality", "UNKNOWN")
    imagery_date = data.get("imageryDate", {})
    imagery_date_str = (
        f"{imagery_date.get('year', '?')}-"
        f"{imagery_date.get('month', '?'):02d}"
        if isinstance(imagery_date.get("month"), int)
        else str(imagery_date)
    )

    async with async_session() as session:
        session.add(
            CachedInsight(
                cache_key=key,
                lat=lat,
                lng=lng,
                imagery_quality=imagery_quality,
                imagery_date=imagery_date_str,
                payload=json.dumps(data),
            )
        )
        await session.commit()

    return data


def summarize_for_frontend(insights: dict) -> dict:
    """Slim down the Solar API response to what the frontend actually needs.

    The Solar API can return tens of kilobytes per building; we trim it to
    the panel layouts, roof segments, and metadata for the UI.
    """
    sp = insights.get("solarPotential", {}) or {}
    configs = sp.get("solarPanelConfigs", []) or []
    panels = sp.get("solarPanels", []) or []

    return {
        "name": insights.get("name"),
        "center": insights.get("center"),
        "boundingBox": insights.get("boundingBox"),
        "imageryQuality": insights.get("imageryQuality"),
        "imageryDate": insights.get("imageryDate"),
        "postalCode": insights.get("postalCode"),
        "administrativeArea": insights.get("administrativeArea"),
        "panelCapacityWatts": sp.get("panelCapacityWatts"),
        "panelHeightMeters": sp.get("panelHeightMeters"),
        "panelWidthMeters": sp.get("panelWidthMeters"),
        "maxArrayPanelsCount": sp.get("maxArrayPanelsCount"),
        "maxArrayAreaMeters2": sp.get("maxArrayAreaMeters2"),
        "maxSunshineHoursPerYear": sp.get("maxSunshineHoursPerYear"),
        "carbonOffsetFactorKgPerMwh": sp.get("carbonOffsetFactorKgPerMwh"),
        "wholeRoofStats": sp.get("wholeRoofStats"),
        "roofSegmentStats": sp.get("roofSegmentStats", []),
        "solarPanelConfigs": configs,
        "solarPanels": panels,
    }


def pick_config_for_target_kwp(insights: dict, target_kwp: Optional[float]) -> Optional[dict]:
    """Choose the panel config closest to a target system size.

    Solar API returns a list of configs (1 panel, 2 panels, ...). We pick the
    one whose total Wp is nearest to the user's target. If `target_kwp` is None,
    return the largest config (default = fill the roof).
    """
    sp = insights.get("solarPotential", {}) or {}
    configs = sp.get("solarPanelConfigs", []) or []
    if not configs:
        return None
    panel_w = sp.get("panelCapacityWatts", 400)

    if target_kwp is None:
        return configs[-1]

    target_w = target_kwp * 1000.0
    return min(configs, key=lambda c: abs(c.get("panelsCount", 0) * panel_w - target_w))
