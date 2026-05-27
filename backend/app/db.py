"""Async SQLAlchemy setup. SQLite for dev, swap DATABASE_URL for Postgres in prod."""
from datetime import datetime
from sqlalchemy import String, Float, DateTime, Integer, Text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from .config import settings


class Base(DeclarativeBase):
    pass


class CachedInsight(Base):
    """Cache of Solar API buildingInsights responses, keyed by rounded lat/lng."""
    __tablename__ = "cached_insights"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cache_key: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    imagery_quality: Mapped[str] = mapped_column(String(16))
    imagery_date: Mapped[str] = mapped_column(String(16))
    payload: Mapped[str] = mapped_column(Text)  # raw JSON
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Lead(Base):
    """Captured installer leads."""
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200), index=True)
    phone: Mapped[str] = mapped_column(String(40))
    address: Mapped[str] = mapped_column(String(300))
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    system_kwp: Mapped[float] = mapped_column(Float)
    annual_kwh: Mapped[float] = mapped_column(Float)
    estimated_cost_eur: Mapped[float] = mapped_column(Float)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
