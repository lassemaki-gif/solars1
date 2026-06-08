export interface MarketConfig {
  id: string;
  countries: string[];
  edition: string;
  cities: string;
  placeholder: string;
  solarDeclination: string;
  defaults: {
    electricityPrice: number;
    feedInPrice: number;
    installCostPerKwp: number;
    selfConsumptionRatio: number;
  };
  locale: string;
  t: {
    kicker: string;
    headline1: string;
    headline2: string;
    body: string;
    pressEnter: string;
    trust1title: string;
    trust1body: string;
    trust2title: string;
    trust2body: string;
    trust3title: string;
    trust3body: string;
    property: string;
    scanningRoof: string;
    noData: string;
    noCoverage: string;
    tryAnother: string;
    disclaimer: string;
    systemSize: string;
    panel: string;
    panels: string;
    max: string;
    adjustAssumptions: string;
    electricityPrice: string;
    feedInPrice: string;
    installCost: string;
    selfConsumption: string;
    calculating: string;
    annualProduction: string;
    kwhPerYear: string;
    yearOneSavings: string;
    systemCost: string;
    payback: string;
    years: string;
    over25yr: string;
    lifetimeGain: string;
    co2Offset: string;
  };
}

export const nordicMarket: MarketConfig = {
  id: "nordic",
  countries: ["fi", "se", "no", "dk"],
  edition: "Nordic edition",
  cities: "Helsinki · Stockholm · Oslo · København",
  placeholder: "Mannerheimintie 1, Helsinki…",
  solarDeclination: "SOLAR DECLINATION · 60°N",
  defaults: {
    electricityPrice: 0.18,
    feedInPrice: 0.05,
    installCostPerKwp: 750,
    selfConsumptionRatio: 0.45,
  },
  locale: "fi-FI",
  t: {
    kicker: "№ 01 — A new map of the sun",
    headline1: "See the sun",
    headline2: "on your roof.",
    body: "Type a Nordic address. We'll measure your roof from satellite, place panels where they earn the most, and tell you what they'll save you in twenty-five years.",
    pressEnter: "Press ↵ after selecting from the suggestions",
    trust1title: "Satellite-measured",
    trust1body: "Roof area, pitch, azimuth and shading from Google Solar API.",
    trust2title: "Nordic economics",
    trust2body: "Local tariffs, feed-in compensation, and install costs by default.",
    trust3title: "Vetted installers",
    trust3body: "Quotes come from certified Nordic installers, not call centres.",
    property: "Property",
    scanningRoof: "Scanning roof data…",
    noData: "No data available.",
    noCoverage: "This address isn't covered by satellite solar data yet. Try a nearby city or a different neighbourhood.",
    tryAnother: "Try another address",
    disclaimer: "Estimates are based on Google Solar API satellite modelling and typical Nordic tariffs. A certified installer will provide a binding quote after a site survey.",
    systemSize: "System size",
    panel: "panel",
    panels: "panels",
    max: "max",
    adjustAssumptions: "Adjust assumptions",
    electricityPrice: "Electricity price",
    feedInPrice: "Feed-in price",
    installCost: "Install cost",
    selfConsumption: "Self-consumption",
    calculating: "Calculating…",
    annualProduction: "Annual production",
    kwhPerYear: "kWh / yr",
    yearOneSavings: "Year-one savings",
    systemCost: "System cost",
    payback: "Payback",
    years: "years",
    over25yr: "> 25 yr",
    lifetimeGain: "25-year net gain",
    co2Offset: "CO₂ offset / yr",
  },
};

export const dachMarket: MarketConfig = {
  id: "dach",
  countries: ["de", "at", "ch"],
  edition: "DACH-Edition",
  cities: "Berlin · Wien · Zürich · München",
  placeholder: "Musterstraße 1, Berlin…",
  solarDeclination: "SOLARE DEKLINATION · 48°N",
  defaults: {
    electricityPrice: 0.30,
    feedInPrice: 0.08,
    installCostPerKwp: 1000,
    selfConsumptionRatio: 0.30,
  },
  locale: "de-DE",
  t: {
    kicker: "№ 01 — Eine neue Sonnenkarte",
    headline1: "Sonne auf",
    headline2: "Ihrem Dach.",
    body: "Geben Sie Ihre Adresse ein. Wir vermessen Ihr Dach per Satellit, platzieren Module optimal und zeigen, was Sie in 25 Jahren sparen.",
    pressEnter: "↵ nach Auswahl bestätigen",
    trust1title: "Satellitenvermessung",
    trust1body: "Dachfläche, Neigung, Ausrichtung und Verschattung per Google Solar API.",
    trust2title: "DACH-Tarife",
    trust2body: "Aktuelle Strompreise, Einspeisevergütung und Installationskosten für DE, AT und CH.",
    trust3title: "Zertifizierte Installateure",
    trust3body: "Angebote von zertifizierten DACH-Installateuren – kein Callcenter.",
    property: "Objekt",
    scanningRoof: "Dachdaten werden geladen…",
    noData: "Keine Daten verfügbar.",
    noCoverage: "Für diese Adresse liegen noch keine Satelliten-Solardaten vor. Versuchen Sie eine nahe gelegene Adresse.",
    tryAnother: "Andere Adresse versuchen",
    disclaimer: "Schätzungen basieren auf Google Solar API und typischen DACH-Tarifen. Ein zertifizierter Installateur erstellt nach einer Vor-Ort-Besichtigung ein verbindliches Angebot.",
    systemSize: "Systemgröße",
    panel: "Modul",
    panels: "Module",
    max: "max",
    adjustAssumptions: "Annahmen anpassen",
    electricityPrice: "Strompreis",
    feedInPrice: "Einspeisevergütung",
    installCost: "Installationskosten",
    selfConsumption: "Eigenverbrauch",
    calculating: "Berechnung…",
    annualProduction: "Jahresertrag",
    kwhPerYear: "kWh/Jahr",
    yearOneSavings: "Ersparnisse Jahr 1",
    systemCost: "Systemkosten",
    payback: "Amortisation",
    years: "Jahre",
    over25yr: "> 25 J.",
    lifetimeGain: "25-Jahre-Ertrag",
    co2Offset: "CO₂-Einsparung/Jahr",
  },
};
