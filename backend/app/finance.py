"""Nordic-tuned financial model for residential solar.

Google's Solar API does not return financial estimates in the EEA (as of
8 July 2025), so we model it ourselves. The model is intentionally simple
and transparent — installers and customers should be able to follow the math.

Inputs (all optional, with sensible Nordic defaults):
  - electricity_price: what the customer pays per kWh today
  - feed_in_price: what they get for excess fed to the grid
  - install_cost_per_kwp: turnkey installed cost
  - self_consumption_ratio: fraction of production consumed on-site
  - annual_degradation: panels lose ~0.5%/year
  - discount_rate: for NPV
  - analysis_years: panel lifetime horizon (25 is standard)
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Optional

from .config import settings


@dataclass
class FinancialInputs:
    annual_kwh_year_one: float
    system_kwp: float
    electricity_price: float = None  # type: ignore
    feed_in_price: float = None  # type: ignore
    install_cost_per_kwp: float = None  # type: ignore
    self_consumption_ratio: float = None  # type: ignore
    annual_degradation: float = None  # type: ignore
    annual_price_inflation: float = 0.02
    discount_rate: float = None  # type: ignore
    analysis_years: int = None  # type: ignore

    def with_defaults(self) -> "FinancialInputs":
        d = settings
        return FinancialInputs(
            annual_kwh_year_one=self.annual_kwh_year_one,
            system_kwp=self.system_kwp,
            electricity_price=self.electricity_price
            if self.electricity_price is not None
            else d.default_electricity_price_eur_per_kwh,
            feed_in_price=self.feed_in_price
            if self.feed_in_price is not None
            else d.default_feed_in_price_eur_per_kwh,
            install_cost_per_kwp=self.install_cost_per_kwp
            if self.install_cost_per_kwp is not None
            else d.default_install_cost_eur_per_kwp,
            self_consumption_ratio=self.self_consumption_ratio
            if self.self_consumption_ratio is not None
            else d.default_self_consumption_ratio,
            annual_degradation=self.annual_degradation
            if self.annual_degradation is not None
            else d.default_annual_degradation,
            annual_price_inflation=self.annual_price_inflation,
            discount_rate=self.discount_rate
            if self.discount_rate is not None
            else d.default_discount_rate,
            analysis_years=self.analysis_years
            if self.analysis_years is not None
            else d.default_analysis_years,
        )


@dataclass
class FinancialResult:
    capex_eur: float
    annual_savings_year_one_eur: float
    lifetime_savings_eur: float
    npv_eur: float
    payback_years: Optional[float]
    irr_estimate: Optional[float]
    yearly_cashflows: list[dict]


def compute_finance(inp: FinancialInputs) -> FinancialResult:
    p = inp.with_defaults()

    capex = p.system_kwp * p.install_cost_per_kwp

    cumulative = -capex
    payback_years: Optional[float] = None
    yearly: list[dict] = []
    npv = -capex

    for year in range(1, p.analysis_years + 1):
        # Production degrades each year
        production_factor = (1 - p.annual_degradation) ** (year - 1)
        kwh = p.annual_kwh_year_one * production_factor

        # Tariffs inflate each year
        price_factor = (1 + p.annual_price_inflation) ** (year - 1)
        elec_price = p.electricity_price * price_factor
        fit_price = p.feed_in_price * price_factor

        self_kwh = kwh * p.self_consumption_ratio
        export_kwh = kwh * (1 - p.self_consumption_ratio)

        savings = self_kwh * elec_price + export_kwh * fit_price

        prev_cumulative = cumulative
        cumulative += savings
        npv += savings / ((1 + p.discount_rate) ** year)

        # Detect payback crossing
        if payback_years is None and cumulative >= 0:
            # Linear interpolation across the year for a smooth payback figure
            frac = (-prev_cumulative) / (cumulative - prev_cumulative) if cumulative != prev_cumulative else 0.0
            payback_years = (year - 1) + frac

        yearly.append(
            {
                "year": year,
                "kwh": round(kwh, 1),
                "savings_eur": round(savings, 2),
                "cumulative_eur": round(cumulative, 2),
            }
        )

    lifetime_savings = cumulative + capex  # = sum of savings over horizon

    # Crude IRR via bisection — good enough for a UI estimate
    irr = _estimate_irr(capex, p)

    return FinancialResult(
        capex_eur=round(capex, 2),
        annual_savings_year_one_eur=round(yearly[0]["savings_eur"], 2) if yearly else 0.0,
        lifetime_savings_eur=round(lifetime_savings, 2),
        npv_eur=round(npv, 2),
        payback_years=round(payback_years, 1) if payback_years is not None else None,
        irr_estimate=round(irr, 4) if irr is not None else None,
        yearly_cashflows=yearly,
    )


def _estimate_irr(capex: float, p: FinancialInputs, *, tol: float = 1e-4) -> Optional[float]:
    """Bisection on the discount rate that makes NPV = 0. Returns None if no sign change."""

    def npv_at(rate: float) -> float:
        total = -capex
        for year in range(1, p.analysis_years + 1):
            production_factor = (1 - p.annual_degradation) ** (year - 1)
            price_factor = (1 + p.annual_price_inflation) ** (year - 1)
            kwh = p.annual_kwh_year_one * production_factor
            elec_price = p.electricity_price * price_factor
            fit_price = p.feed_in_price * price_factor
            self_kwh = kwh * p.self_consumption_ratio
            export_kwh = kwh * (1 - p.self_consumption_ratio)
            cf = self_kwh * elec_price + export_kwh * fit_price
            total += cf / ((1 + rate) ** year)
        return total

    lo, hi = -0.5, 1.0
    if npv_at(lo) * npv_at(hi) > 0:
        return None  # no sign change in range
    for _ in range(60):
        mid = (lo + hi) / 2
        v = npv_at(mid)
        if abs(v) < tol:
            return mid
        if v > 0:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def serialize(result: FinancialResult) -> dict:
    return asdict(result)
