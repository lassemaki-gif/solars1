"""Application config, loaded from environment."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    google_maps_api_key: str = ""
    # Comma-separated list of allowed CORS origins, e.g.
    # "https://solars.solutions,https://www.solars.solutions,http://localhost:3000"
    frontend_origins: str = "http://localhost:3000"
    database_url: str = "sqlite+aiosqlite:///./solarscope.db"

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]

    # Nordic financial model defaults
    default_electricity_price_eur_per_kwh: float = 0.18
    default_feed_in_price_eur_per_kwh: float = 0.05
    default_install_cost_eur_per_kwp: float = 750.0
    default_self_consumption_ratio: float = 0.45
    default_annual_degradation: float = 0.005
    default_discount_rate: float = 0.03
    default_analysis_years: int = 25


settings = Settings()
