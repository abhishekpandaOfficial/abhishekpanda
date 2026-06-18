export type ArgusAssetKind = "ship" | "drone" | "missile" | "satellite" | "conflict";

export type ArgusAssetRow = {
  id: string;
  kind: ArgusAssetKind;
  code: string;
  name: string;
  type_label: string | null;
  flag: string | null;
  status: string | null;
  details: string | null;
  lat: number | null;
  lng: number | null;
  target_lat: number | null;
  target_lng: number | null;
  heading: number | null;
  speed: number | null;
  altitude: number | null;
  orbit: string | null;
  inclination: number | null;
  casualty_level: string | null;
  severity: string | null;
  color: string | null;
  polygon: Array<[number, number]> | null;
  metadata: Record<string, unknown> | null;
  is_active: boolean;
  sort_order: number | null;
  created_at?: string;
  updated_at?: string;
};

export type ArgusOperatorInfo = {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  source: string;
};

type ArgusBridgePayload = {
  operator?: Partial<ArgusOperatorInfo>;
  assets?: {
    ships: Array<Record<string, unknown>>;
    drones: Array<Record<string, unknown>>;
    missiles: Array<Record<string, unknown>>;
    sats: Array<Record<string, unknown>>;
    conflicts: Array<Record<string, unknown>>;
  };
};

const asFiniteNumber = (value: unknown) => {
  const next = typeof value === "number" ? value : Number(value);
  return Number.isFinite(next) ? next : null;
};

const asText = (value: unknown, fallback = "") => (typeof value === "string" && value.trim() ? value.trim() : fallback);

const normalizePolygon = (value: unknown): Array<[number, number]> => {
  if (!Array.isArray(value)) return [];
  return value
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) return null;
      const lat = asFiniteNumber(point[0]);
      const lng = asFiniteNumber(point[1]);
      return lat === null || lng === null ? null : ([lat, lng] as [number, number]);
    })
    .filter(Boolean) as Array<[number, number]>;
};

export const buildArgusBridgePayload = (
  rows: ArgusAssetRow[],
  operator?: Partial<ArgusOperatorInfo> | null,
): ArgusBridgePayload => {
  const activeRows = rows
    .filter((row) => row.is_active !== false)
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name));

  return {
    operator: operator || undefined,
    assets: {
      ships: activeRows
        .filter((row) => row.kind === "ship")
        .map((row) => ({
          id: row.code || row.id,
          name: row.name,
          type: row.type_label || "Naval Asset",
          flag: row.flag || "",
          lat: row.lat ?? 0,
          lng: row.lng ?? 0,
          hdg: row.heading ?? 0,
          spd: row.speed ?? 0,
          stat: row.status || "ACTIVE",
          cls: asText(row.metadata?.class, "SURFACE"),
        })),
      drones: activeRows
        .filter((row) => row.kind === "drone")
        .map((row) => ({
          id: row.code || row.id,
          name: row.name,
          type: row.type_label || "UAV",
          flag: row.flag || "",
          lat: row.lat ?? 0,
          lng: row.lng ?? 0,
          hdg: row.heading ?? 0,
          alt: row.altitude ?? 0,
          stat: row.status || "ACTIVE",
          spd: row.speed ?? 0,
        })),
      missiles: activeRows
        .filter((row) => row.kind === "missile")
        .map((row) => ({
          id: row.code || row.id,
          name: row.name,
          type: row.type_label || "Missile",
          flag: row.flag || "",
          lat: row.lat ?? 0,
          lng: row.lng ?? 0,
          tlat: row.target_lat ?? row.lat ?? 0,
          tlng: row.target_lng ?? row.lng ?? 0,
          stat: row.status || "READY",
          phase: asText(row.metadata?.phase, "STATIC"),
        })),
      sats: activeRows
        .filter((row) => row.kind === "satellite")
        .map((row) => ({
          id: row.code || row.id,
          name: row.name,
          type: row.type_label || "Satellite",
          flag: row.flag || "",
          lat: row.lat ?? 0,
          lng: row.lng ?? 0,
          alt: row.orbit || (row.altitude !== null ? `${row.altitude} km` : "LEO"),
          inc: row.inclination ?? 0,
          stat: row.status || "ACTIVE",
          orbit: row.orbit || "LEO",
        })),
      conflicts: activeRows
        .filter((row) => row.kind === "conflict")
        .map((row) => ({
          id: row.code || row.id,
          name: row.name,
          sev: row.severity || "medium",
          stat: row.status || "ACTIVE",
          cas: row.casualty_level || "LOW",
          poly: normalizePolygon(row.polygon),
        })),
    },
  };
};

export const emptyArgusAsset = (kind: ArgusAssetKind): ArgusAssetRow => ({
  id: "",
  kind,
  code: "",
  name: "",
  type_label: "",
  flag: "",
  status: "",
  details: "",
  lat: null,
  lng: null,
  target_lat: null,
  target_lng: null,
  heading: null,
  speed: null,
  altitude: null,
  orbit: "",
  inclination: null,
  casualty_level: "",
  severity: kind === "conflict" ? "medium" : "",
  color: "",
  polygon: [],
  metadata: {},
  is_active: true,
  sort_order: 0,
});

const operatorSources = [
  {
    name: "ipapi",
    url: "https://ipapi.co/json/",
    parse: async (response: Response) => {
      const data = await response.json();
      return {
        ip: data.ip,
        city: data.city,
        region: data.region || data.region_code,
        country: data.country_name || data.country,
        isp: data.org,
        timezone: data.timezone,
        latitude: asFiniteNumber(data.latitude),
        longitude: asFiniteNumber(data.longitude),
      };
    },
  },
  {
    name: "ip-api",
    url: "https://ip-api.com/json/?fields=status,message,country,countryCode,regionName,city,isp,org,as,query,timezone,lat,lon",
    parse: async (response: Response) => {
      const data = await response.json();
      return {
        ip: data.query,
        city: data.city,
        region: data.regionName,
        country: data.country,
        isp: data.org || data.isp,
        timezone: data.timezone,
        latitude: asFiniteNumber(data.lat),
        longitude: asFiniteNumber(data.lon),
      };
    },
  },
  {
    name: "ipwhois",
    url: "https://ipwhois.app/json/",
    parse: async (response: Response) => {
      const data = await response.json();
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        isp: data.isp || data.org,
        timezone: data.timezone,
        latitude: asFiniteNumber(data.latitude),
        longitude: asFiniteNumber(data.longitude),
      };
    },
  },
];

export const fetchOperatorInfo = async (): Promise<ArgusOperatorInfo | null> => {
  for (const source of operatorSources) {
    try {
      const response = await fetch(source.url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) continue;
      const parsed = await source.parse(response);
      if (!parsed.ip) continue;
      return {
        ip: asText(parsed.ip, "UNKNOWN"),
        city: asText(parsed.city, "Unknown city"),
        region: asText(parsed.region),
        country: asText(parsed.country, "Unknown country"),
        isp: asText(parsed.isp, "Unknown ISP"),
        timezone: asText(parsed.timezone, "UTC"),
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        source: source.name,
      };
    } catch (_error) {
      // Continue to the next provider.
    }
  }

  return null;
};
