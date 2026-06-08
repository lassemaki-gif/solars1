"""Pydantic schemas — the contract between backend and frontend."""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class InsightsRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    required_quality: str = Field("MEDIUM", pattern="^(HIGH|MEDIUM|BASE)$")


class FinanceRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    target_kwp: Optional[float] = Field(None, ge=0, le=100)
    electricity_price: Optional[float] = Field(None, ge=0, le=2)
    feed_in_price: Optional[float] = Field(None, ge=0, le=2)
    install_cost_per_kwp: Optional[float] = Field(None, ge=0, le=150000)
    self_consumption_ratio: Optional[float] = Field(None, ge=0, le=1)


class LeadRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=4, max_length=40)
    address: str = Field(..., min_length=1, max_length=300)
    lat: float
    lng: float
    system_kwp: float
    annual_kwh: float
    estimated_cost_eur: float
    notes: str = ""


class LeadResponse(BaseModel):
    id: int
    ok: bool = True
