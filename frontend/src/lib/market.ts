export interface MarketConfig {
  id: string;
  countries: string[];
  edition: string;
  cities: string;
  placeholder: string;
  solarDeclination: string;
  currencySymbol: string;
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
  currencySymbol: "€",
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
  currencySymbol: "€",
  defaults: {
    electricityPrice: 0.39,
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

export const ukMarket: MarketConfig = {
  id: "uk",
  countries: ["gb"],
  edition: "UK edition",
  cities: "London · Manchester · Edinburgh · Bristol",
  placeholder: "1 Baker Street, London…",
  solarDeclination: "SOLAR DECLINATION · 52°N",
  currencySymbol: "£",
  defaults: {
    electricityPrice: 0.26,
    feedInPrice: 0.05,
    installCostPerKwp: 1000,
    selfConsumptionRatio: 0.50,
  },
  locale: "en-GB",
  t: {
    kicker: "№ 01 — A new map of the sun",
    headline1: "See the sun",
    headline2: "on your roof.",
    body: "Type a UK address. We'll measure your roof from satellite, place panels where they earn the most, and tell you what they'll save you in twenty-five years.",
    pressEnter: "Press ↵ after selecting from the suggestions",
    trust1title: "Satellite-measured",
    trust1body: "Roof area, pitch, azimuth and shading from Google Solar API.",
    trust2title: "UK economics",
    trust2body: "Current tariffs, SEG export rates, and install costs for the UK.",
    trust3title: "MCS-certified installers",
    trust3body: "Quotes come from MCS-certified UK installers, not call centres.",
    property: "Property",
    scanningRoof: "Scanning roof data…",
    noData: "No data available.",
    noCoverage: "This address isn't covered by satellite solar data yet. Try a nearby town or a different street.",
    tryAnother: "Try another address",
    disclaimer: "Estimates are based on Google Solar API satellite modelling and typical UK tariffs. An MCS-certified installer will provide a binding quote after a site survey.",
    systemSize: "System size",
    panel: "panel",
    panels: "panels",
    max: "max",
    adjustAssumptions: "Adjust assumptions",
    electricityPrice: "Electricity price",
    feedInPrice: "SEG export rate",
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

export const frMarket: MarketConfig = {
  id: "fr",
  countries: ["fr"],
  edition: "Édition France",
  cities: "Paris · Lyon · Marseille · Bordeaux",
  placeholder: "1 rue de Rivoli, Paris…",
  solarDeclination: "DÉCLINAISON SOLAIRE · 46°N",
  currencySymbol: "€",
  defaults: {
    electricityPrice: 0.25,
    feedInPrice: 0.10,
    installCostPerKwp: 1100,
    selfConsumptionRatio: 0.40,
  },
  locale: "fr-FR",
  t: {
    kicker: "№ 01 — La carte du soleil",
    headline1: "Voyez le soleil",
    headline2: "sur votre toit.",
    body: "Saisissez une adresse en France. Nous mesurons votre toiture par satellite, positionnons les panneaux là où ils rapportent le plus et vous montrons vos économies sur vingt-cinq ans.",
    pressEnter: "Appuyez sur ↵ après avoir sélectionné",
    trust1title: "Mesure satellitaire",
    trust1body: "Surface, inclinaison, orientation et ombrage du toit par Google Solar API.",
    trust2title: "Tarifs français",
    trust2body: "Prix de l'électricité, tarif de rachat et coûts d'installation pour la France.",
    trust3title: "Installateurs RGE",
    trust3body: "Les devis viennent d'installateurs RGE certifiés, pas de centres d'appel.",
    property: "Propriété",
    scanningRoof: "Analyse du toit en cours…",
    noData: "Aucune donnée disponible.",
    noCoverage: "Cette adresse n'est pas encore couverte par les données satellitaires. Essayez une adresse voisine ou un autre quartier.",
    tryAnother: "Essayer une autre adresse",
    disclaimer: "Les estimations sont basées sur la modélisation satellitaire Google Solar API et les tarifs français typiques. Un installateur RGE vous fournira un devis définitif après visite sur site.",
    systemSize: "Taille du système",
    panel: "panneau",
    panels: "panneaux",
    max: "max",
    adjustAssumptions: "Ajuster les hypothèses",
    electricityPrice: "Prix de l'électricité",
    feedInPrice: "Tarif de rachat",
    installCost: "Coût d'installation",
    selfConsumption: "Autoconsommation",
    calculating: "Calcul en cours…",
    annualProduction: "Production annuelle",
    kwhPerYear: "kWh / an",
    yearOneSavings: "Économies année 1",
    systemCost: "Coût du système",
    payback: "Amortissement",
    years: "ans",
    over25yr: "> 25 ans",
    lifetimeGain: "Gain net sur 25 ans",
    co2Offset: "Réduction CO₂ / an",
  },
};
