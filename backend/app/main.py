"""FastAPI entrypoint.

Routes:
  POST /api/insights   — get roof + solar potential summary (cached)
  POST /api/finance    — run the Nordic financial model on a chosen system size
  POST /api/leads      — capture an installer lead
  GET  /api/health     — liveness probe
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from .config import settings
from .db import Lead, async_session, init_db
from .finance import FinancialInputs, compute_finance, serialize
from .schemas import (
    FinanceRequest,
    InsightsRequest,
    LeadRequest,
    LeadResponse,
)
from .solar_client import (
    SolarAPIError,
    fetch_building_insights,
    pick_config_for_target_kwp,
    summarize_for_frontend,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    yield


app = FastAPI(title="SolarScope API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict:
    return {"ok": True}


@app.post("/api/insights")
async def insights(body: InsightsRequest) -> dict:
    try:
        raw = await fetch_building_insights(
            body.lat, body.lng, required_quality=body.required_quality
        )
    except SolarAPIError as e:
        raise HTTPException(status_code=e.status, detail={"code": e.code, "message": str(e)})
    return summarize_for_frontend(raw)


@app.post("/api/finance")
async def finance(body: FinanceRequest) -> dict:
    try:
        raw = await fetch_building_insights(body.lat, body.lng)
    except SolarAPIError as e:
        raise HTTPException(status_code=e.status, detail={"code": e.code, "message": str(e)})

    config = pick_config_for_target_kwp(raw, body.target_kwp)
    if not config:
        raise HTTPException(
            status_code=422,
            detail={"code": "no_config", "message": "No panel configuration available for this roof."},
        )

    sp = raw.get("solarPotential", {})
    panel_w = sp.get("panelCapacityWatts", 400)
    panels_count = config.get("panelsCount", 0)
    annual_kwh = config.get("yearlyEnergyDcKwh", 0.0)
    system_kwp = panels_count * panel_w / 1000.0

    fin = compute_finance(
        FinancialInputs(
            annual_kwh_year_one=annual_kwh,
            system_kwp=system_kwp,
            electricity_price=body.electricity_price,
            feed_in_price=body.feed_in_price,
            install_cost_per_kwp=body.install_cost_per_kwp,
            self_consumption_ratio=body.self_consumption_ratio,
        )
    )

    return {
        "panels_count": panels_count,
        "system_kwp": round(system_kwp, 2),
        "annual_kwh_year_one": round(annual_kwh, 1),
        "co2_offset_kg_year_one": round(
            annual_kwh * (sp.get("carbonOffsetFactorKgPerMwh", 400) / 1000.0), 1
        ),
        "finance": serialize(fin),
    }


@app.post("/api/leads", response_model=LeadResponse)
async def create_lead(body: LeadRequest) -> LeadResponse:
    async with async_session() as session:
        lead = Lead(
            name=body.name,
            email=body.email,
            phone=body.phone,
            address=body.address,
            lat=body.lat,
            lng=body.lng,
            system_kwp=body.system_kwp,
            annual_kwh=body.annual_kwh,
            estimated_cost_eur=body.estimated_cost_eur,
            notes=body.notes,
        )
        session.add(lead)
        await session.commit()
        await session.refresh(lead)
        return LeadResponse(id=lead.id)


@app.get("/api/leads")
async def list_leads(x_leads_secret: str | None = Header(default=None)) -> list[dict]:
    if not settings.leads_secret or x_leads_secret != settings.leads_secret:
        raise HTTPException(status_code=401, detail="Unauthorized")
    async with async_session() as session:
        rows = (await session.execute(select(Lead).order_by(Lead.created_at.desc()))).scalars().all()
        return [
            {
                "id": r.id,
                "name": r.name,
                "email": r.email,
                "phone": r.phone,
                "address": r.address,
                "system_kwp": r.system_kwp,
                "annual_kwh": r.annual_kwh,
                "estimated_cost_eur": r.estimated_cost_eur,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]
