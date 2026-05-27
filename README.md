# SolarScope

Instant solar estimates for Nordic homes. Type an address → see panel placement on your roof from satellite imagery → get a 25-year financial projection → request a quote from a vetted installer.

## Architecture

```
┌─────────────────┐         ┌────────────────────┐         ┌───────────────────┐
│  Next.js (App)  │ ──API──▶│  FastAPI backend   │ ──HTTPS─▶│ Google Solar API │
│  Tailwind + TS  │         │  + SQLite cache    │         │   buildingInsights │
└─────────────────┘         └────────────────────┘         └───────────────────┘
                                      │
                                      ▼
                            ┌────────────────────┐
                            │  Postgres (prod)    │
                            │  • cached_insights  │
                            │  • leads            │
                            └────────────────────┘
```

The frontend never calls the Solar API directly. The backend proxies, caches, and runs the Nordic financial model (Google strips financial fields from Solar API responses in the EEA).

## Quick start

### Prerequisites
- Python 3.11+, Node 20+
- A Google Maps Platform API key with these APIs enabled:
  - **Solar API** (required)
  - **Maps JavaScript API** (for the satellite view)
  - **Places API** (for address autocomplete)
- Restrict the key to your domains in the Cloud console.

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in GOOGLE_MAPS_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # fill in NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
npm run dev
```

Visit http://localhost:3000

## Key design decisions

**Why cache Solar API responses.** Building Insights has a 10k/month free tier, then pay-as-you-go. Each building's geometry doesn't change between visits, so we cache by rounded lat/lng (~11m resolution) in the DB. A returning visitor running the configurator with different bill numbers hits the cache, not Google.

**Why we don't call Data Layers.** Data Layers is a separate, much more expensive SKU (1k/month free) that returns raster TIFFs. We don't need it for the lead-gen flow; Building Insights returns enough geometry to render the panel overlay.

**Why our own financial model.** Google strips `financialAnalyses` from Solar API responses in the EEA. Defaults reflect typical Finnish residential conditions; the configurator lets the user override them. Defaults:
- Electricity €0.18/kWh, feed-in €0.05/kWh
- Install cost €1500/kWp
- 45% self-consumption ratio (typical without battery)
- 0.5% annual panel degradation, 2% tariff inflation, 3% discount rate, 25-year horizon

**Imagery quality is shown in the UI.** Solar API returns HIGH / MEDIUM / BASE quality tiers plus an imagery date. We display both so users know how trustworthy the estimate is — finer than "trust us, the satellite saw it."

## Production checklist

- [ ] Swap SQLite → Postgres (set `DATABASE_URL`)
- [ ] Put `/api/leads` GET behind auth (currently open!)
- [ ] Add rate limiting (e.g. SlowAPI for FastAPI)
- [ ] Set a daily quota in Google Cloud console to cap spend
- [ ] Configure error monitoring (Sentry)
- [ ] Forward leads to installer CRM (HubSpot, Pipedrive, or webhook)
- [ ] GDPR: consent checkbox on the lead form, privacy policy, data export endpoint
- [ ] Cookie banner (the Google Maps cookie counts)
- [ ] Localized copy for SE, NO, DK

## Project structure

```
solarscope/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI routes
│   │   ├── solar_client.py    # Google Solar API wrapper + cache
│   │   ├── finance.py         # Nordic financial model
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── db.py              # SQLAlchemy models
│   │   └── config.py          # Settings from .env
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx        # Landing + results view
    │   │   ├── layout.tsx
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── AddressAutocomplete.tsx
    │   │   ├── RoofMap.tsx     # Satellite view + panel polygons
    │   │   ├── Configurator.tsx
    │   │   └── LeadForm.tsx
    │   └── lib/api.ts          # Typed backend client
    └── package.json
```

## Cost ballpark

Assume a conversion funnel: 1,000 visitors → 600 enter an address → 400 view the result → 80 submit a lead. At ~10c per buildingInsights call beyond the free tier, Solar API cost per lead is well under €1. The economics work even at low installer-paid lead prices (€20–€80 is typical in Nordic solar).
