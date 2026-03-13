import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Eye,
  Globe,
  type LucideIcon,
  MapPinned,
  Pencil,
  Radar,
  Satellite,
  Save,
  Shield,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArgusAssetKind, type ArgusAssetRow, emptyArgusAsset } from "@/lib/argus";

type ArgusViewEventRow = {
  id: string;
  event_type: string;
  page_path: string;
  session_id: string | null;
  ip_address: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  user_agent: string | null;
  referrer: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type ClassifiedAccessRequestRow = {
  id: string;
  name: string;
  email: string;
  request_ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  source: string | null;
  user_agent: string | null;
  verified_at: string | null;
  created_at: string;
};

type ArgusSection = "overview" | "viewers" | "access" | ArgusAssetKind;

const db = supabase as unknown as {
  from: (table: string) => any;
};

const sectionMeta: Array<{
  id: ArgusSection;
  label: string;
  kind?: ArgusAssetKind;
  icon: LucideIcon;
  accent: string;
}> = [
  { id: "overview", label: "Overview", icon: Radar, accent: "text-cyan-400" },
  { id: "viewers", label: "Viewer Logs", icon: Eye, accent: "text-emerald-400" },
  { id: "access", label: "Access Logs", icon: Shield, accent: "text-fuchsia-400" },
  { id: "ship", label: "Ships", kind: "ship", icon: Globe, accent: "text-sky-400" },
  { id: "drone", label: "Drones", kind: "drone", icon: Activity, accent: "text-amber-400" },
  { id: "missile", label: "Missiles", kind: "missile", icon: Shield, accent: "text-rose-400" },
  { id: "satellite", label: "Satellites", kind: "satellite", icon: Satellite, accent: "text-violet-400" },
  { id: "conflict", label: "Conflicts", kind: "conflict", icon: MapPinned, accent: "text-orange-400" },
];

const parseNumberInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const next = Number(trimmed);
  return Number.isFinite(next) ? next : null;
};

const parsePolygonText = (value: string): Array<[number, number]> => {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [latRaw, lngRaw] = line.split(",").map((part) => part.trim());
      const lat = Number(latRaw);
      const lng = Number(lngRaw);
      return Number.isFinite(lat) && Number.isFinite(lng) ? ([lat, lng] as [number, number]) : null;
    })
    .filter(Boolean) as Array<[number, number]>;
};

const serializePolygon = (polygon: Array<[number, number]> | null | undefined) =>
  (polygon || []).map(([lat, lng]) => `${lat}, ${lng}`).join("\n");

const toJsonText = (value: Record<string, unknown> | null | undefined) => JSON.stringify(value || {}, null, 2);

const formatPlace = (row: ArgusViewEventRow) => [row.city, row.region, row.country].filter(Boolean).join(", ") || "Unknown";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const sectionDescription: Record<Exclude<ArgusSection, ArgusAssetKind>, string> = {
  overview: "Monitor classified viewers, OTP-gated visitors, and current asset inventory.",
  viewers: "Raw load telemetry captured from `/classified`, including IP and browser fingerprints.",
  access: "Name + email submissions and OTP verification records for classified access.",
};

const buildAssetPayload = (asset: ArgusAssetRow, metadataText: string, polygonText: string) => {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = metadataText.trim() ? JSON.parse(metadataText) : {};
  } catch {
    throw new Error("Metadata JSON is invalid.");
  }

  return {
    kind: asset.kind,
    code: asset.code.trim(),
    name: asset.name.trim(),
    type_label: asset.type_label?.trim() || null,
    flag: asset.flag?.trim() || null,
    status: asset.status?.trim() || null,
    details: asset.details?.trim() || null,
    lat: asset.lat,
    lng: asset.lng,
    target_lat: asset.target_lat,
    target_lng: asset.target_lng,
    heading: asset.heading,
    speed: asset.speed,
    altitude: asset.altitude,
    orbit: asset.orbit?.trim() || null,
    inclination: asset.inclination,
    casualty_level: asset.casualty_level?.trim() || null,
    severity: asset.severity?.trim() || null,
    color: asset.color?.trim() || null,
    polygon: parsePolygonText(polygonText),
    metadata,
    is_active: asset.is_active,
    sort_order: asset.sort_order ?? 0,
  };
};

const kindDescription: Record<ArgusAssetKind, string> = {
  ship: "Managed naval assets rendered in the classified surface.",
  drone: "Managed UAV and ISR assets rendered in the classified surface.",
  missile: "Managed missile trajectories and launch states rendered in the classified surface.",
  satellite: "Managed orbital assets rendered in the classified surface.",
  conflict: "Managed conflict polygons and severity overlays rendered in the classified surface.",
};

export default function AdminArgusControl() {
  const queryClient = useQueryClient();
  const [section, setSection] = useState<ArgusSection>("overview");
  const [editor, setEditor] = useState<ArgusAssetRow>(emptyArgusAsset("ship"));
  const [polygonText, setPolygonText] = useState("");
  const [metadataText, setMetadataText] = useState("{}");

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["admin-argus-assets"],
    queryFn: async () => {
      const { data, error } = await db.from("argus_assets").select("*").order("kind").order("sort_order").order("name");
      if (error) throw error;
      return (data || []) as ArgusAssetRow[];
    },
  });

  const { data: viewerLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["admin-argus-viewers"],
    queryFn: async () => {
      const { data, error } = await db
        .from("argus_view_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(250);
      if (error) throw error;
      return (data || []) as ArgusViewEventRow[];
    },
  });

  const { data: accessLogs = [], isLoading: accessLoading } = useQuery({
    queryKey: ["admin-argus-access-requests"],
    queryFn: async () => {
      const { data, error } = await db
        .from("classified_access_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(250);
      if (error) {
        console.error("classified_access_requests query error", error);
        return [] as ClassifiedAccessRequestRow[];
      }
      return (data || []) as ClassifiedAccessRequestRow[];
    },
  });

  const saveAsset = useMutation({
    mutationFn: async () => {
      if (!editor.name.trim()) throw new Error("Asset name is required.");
      if (!editor.code.trim()) throw new Error("Asset code is required.");
      const payload = buildAssetPayload(editor, metadataText, polygonText);

      if (editor.id) {
        const { error } = await db.from("argus_assets").update(payload).eq("id", editor.id);
        if (error) throw error;
      } else {
        const { error } = await db.from("argus_assets").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-argus-assets"] });
      toast.success("ARGUS asset saved.");
      setEditor(emptyArgusAsset(editor.kind));
      setPolygonText("");
      setMetadataText("{}");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to save ARGUS asset."),
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("argus_assets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-argus-assets"] });
      toast.success("ARGUS asset deleted.");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to delete ARGUS asset."),
  });

  const deleteViewerLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("argus_view_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-argus-viewers"] });
      toast.success("Viewer log removed.");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to delete viewer log."),
  });

  const countsByKind = useMemo(() => {
    const counts = new Map<ArgusAssetKind, number>([
      ["ship", 0],
      ["drone", 0],
      ["missile", 0],
      ["satellite", 0],
      ["conflict", 0],
    ]);
    assets.forEach((asset) => counts.set(asset.kind, (counts.get(asset.kind) || 0) + 1));
    return counts;
  }, [assets]);

  const activeViewerCount = useMemo(() => new Set(viewerLogs.map((row) => row.session_id).filter(Boolean)).size, [viewerLogs]);
  const verifiedAccessCount = useMemo(() => accessLogs.filter((row) => Boolean(row.verified_at)).length, [accessLogs]);

  const selectedKind = sectionMeta.find((item) => item.id === section)?.kind || null;
  const filteredAssets = selectedKind ? assets.filter((asset) => asset.kind === selectedKind) : [];

  const openNewEditor = (kind: ArgusAssetKind) => {
    setSection(kind);
    setEditor(emptyArgusAsset(kind));
    setPolygonText("");
    setMetadataText("{}");
  };

  const openEditor = (asset: ArgusAssetRow) => {
    setSection(asset.kind);
    setEditor(asset);
    setPolygonText(serializePolygon(asset.polygon));
    setMetadataText(toJsonText(asset.metadata));
  };

  const selectedMeta = sectionMeta.find((item) => item.id === section) || sectionMeta[0];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Argus VIII</p>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Surveillance Admin</h1>
        <p className="max-w-4xl text-sm leading-7 text-muted-foreground">
          The IPv6 shown on `/classified` is the detected visitor network address from the page geolocation provider. This panel keeps those
          view logs private in admin, and lets you manage the ships, drones, missiles, satellites, and conflict overlays rendered on the
          classified surface.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="admin-panel border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Tracked Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{assets.length}</div>
            <p className="mt-2 text-xs text-muted-foreground">Managed ARGUS overlays across all asset classes.</p>
          </CardContent>
        </Card>
        <Card className="admin-panel border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Viewer Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{activeViewerCount}</div>
            <p className="mt-2 text-xs text-muted-foreground">Distinct sessions captured from `/classified` loads.</p>
          </CardContent>
        </Card>
        <Card className="admin-panel border-violet-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">View Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{viewerLogs.length}</div>
            <p className="mt-2 text-xs text-muted-foreground">Recent captured loads with IP, place, and browser metadata.</p>
          </CardContent>
        </Card>
        <Card className="admin-panel border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Live Feed Note</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-foreground">Flights remain external live feed</div>
            <p className="mt-2 text-xs text-muted-foreground">Ships, drones, missiles, satellites, and conflicts are now admin-managed.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="admin-panel">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sectionMeta.map((item) => {
              const Icon = item.icon;
              const count = item.kind
                ? countsByKind.get(item.kind) || 0
                : item.id === "viewers"
                  ? viewerLogs.length
                  : item.id === "access"
                    ? accessLogs.length
                    : assets.length;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    section === item.id
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border/60 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${item.accent}`} />
                    <span className="font-medium">{item.label}</span>
                  </span>
                  <Badge variant="outline" className="border-border/60 bg-background/80 text-muted-foreground">
                    {count}
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="admin-panel">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-foreground">{selectedMeta.label}</CardTitle>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {selectedKind ? kindDescription[selectedKind] : sectionDescription[section as Exclude<ArgusSection, ArgusAssetKind>]}
                </p>
              </div>
              {selectedKind ? (
                <Button onClick={() => openNewEditor(selectedKind)} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  New {selectedMeta.label.slice(0, -1)}
                </Button>
              ) : null}
            </CardHeader>
          </Card>

          {section === "overview" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="admin-panel">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Asset Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(["ship", "drone", "missile", "satellite", "conflict"] as ArgusAssetKind[]).map((kind) => (
                    <div key={kind} className="admin-surface flex items-center justify-between px-4 py-3">
                      <span className="font-medium capitalize text-foreground">{kind}</span>
                      <Badge variant="outline" className="border-border/60 bg-background/80 text-muted-foreground">
                        {countsByKind.get(kind) || 0}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="admin-panel">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Latest Access Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {accessLogs.slice(0, 6).map((row) => (
                    <div key={row.id} className="admin-surface px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-foreground">{row.name || "Unknown visitor"}</div>
                        <div className="text-xs text-muted-foreground">{formatDateTime(row.created_at)}</div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{row.email || "No email"}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {row.request_ip || "Unknown IP"} • {[row.city, row.country].filter(Boolean).join(", ") || "Unknown location"} •{" "}
                        {row.verified_at ? "Verified" : "Pending"}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {section === "viewers" ? (
            <Card className="admin-panel">
              <CardContent className="pt-6">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead>Loaded At</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>ISP</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>User Agent</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(logsLoading ? [] : viewerLogs).map((row) => (
                        <TableRow key={row.id} className="border-slate-800">
                          <TableCell className="text-foreground">{formatDateTime(row.created_at)}</TableCell>
                          <TableCell className="font-mono text-xs text-cyan-300">{row.ip_address || "Unknown"}</TableCell>
                          <TableCell className="text-foreground">{formatPlace(row)}</TableCell>
                          <TableCell className="text-muted-foreground">{row.isp || "Unknown"}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{row.session_id || "-"}</TableCell>
                          <TableCell className="max-w-[320px] truncate text-xs text-muted-foreground">{row.user_agent || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteViewerLog.mutate(row.id)}
                              className="text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : null}

          {section === "access" ? (
            <Card className="admin-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-foreground">Classified OTP Access Logs</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {verifiedAccessCount} verified of {accessLogs.length} requests
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead>Requested At</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(accessLoading ? [] : accessLogs).map((row) => (
                        <TableRow key={row.id} className="border-slate-800">
                          <TableCell className="text-foreground">{formatDateTime(row.created_at)}</TableCell>
                          <TableCell className="text-foreground">{row.name}</TableCell>
                          <TableCell className="text-foreground">{row.email}</TableCell>
                          <TableCell className="font-mono text-xs text-cyan-300">{row.request_ip || "Unknown"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {[row.city, row.region].filter(Boolean).join(", ") || "Unknown"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{row.country || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                row.verified_at
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                              }
                            >
                              {row.verified_at ? "Verified" : "Pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : null}

          {selectedKind ? (
            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_420px]">
              <Card className="admin-panel">
                <CardContent className="pt-6">
                  <ScrollArea className="w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Coordinates</TableHead>
                          <TableHead>Sort</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(assetsLoading ? [] : filteredAssets).map((asset) => (
                          <TableRow key={asset.id} className="border-slate-800">
                            <TableCell className="font-mono text-xs text-cyan-300">{asset.code}</TableCell>
                            <TableCell>
                              <div className="font-medium text-foreground">{asset.name}</div>
                              <div className="text-xs text-muted-foreground">{asset.type_label || "Unspecified"}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-border/60 bg-background/80 text-muted-foreground">
                                {asset.status || "ACTIVE"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {asset.lat ?? "?"}, {asset.lng ?? "?"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{asset.sort_order ?? 0}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditor(asset)} className="text-muted-foreground hover:text-foreground">
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteAsset.mutate(asset.id)}
                                  className="text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="admin-panel">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">{editor.id ? "Edit Asset" : "New Asset"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Code</label>
                      <Input value={editor.code} onChange={(e) => setEditor((prev) => ({ ...prev, code: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Name</label>
                      <Input value={editor.name} onChange={(e) => setEditor((prev) => ({ ...prev, name: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Type</label>
                      <Input value={editor.type_label || ""} onChange={(e) => setEditor((prev) => ({ ...prev, type_label: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</label>
                      <Input value={editor.status || ""} onChange={(e) => setEditor((prev) => ({ ...prev, status: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Flag</label>
                      <Input value={editor.flag || ""} onChange={(e) => setEditor((prev) => ({ ...prev, flag: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sort Order</label>
                      <Input
                        value={editor.sort_order ?? 0}
                        onChange={(e) => setEditor((prev) => ({ ...prev, sort_order: parseNumberInput(e.target.value) ?? 0 }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Latitude</label>
                      <Input value={editor.lat ?? ""} onChange={(e) => setEditor((prev) => ({ ...prev, lat: parseNumberInput(e.target.value) }))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Longitude</label>
                      <Input value={editor.lng ?? ""} onChange={(e) => setEditor((prev) => ({ ...prev, lng: parseNumberInput(e.target.value) }))} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Heading</label>
                      <Input
                        value={editor.heading ?? ""}
                        onChange={(e) => setEditor((prev) => ({ ...prev, heading: parseNumberInput(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Speed</label>
                      <Input value={editor.speed ?? ""} onChange={(e) => setEditor((prev) => ({ ...prev, speed: parseNumberInput(e.target.value) }))} />
                    </div>
                  </div>

                  {editor.kind === "drone" || editor.kind === "satellite" ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Altitude</label>
                        <Input
                          value={editor.altitude ?? ""}
                          onChange={(e) => setEditor((prev) => ({ ...prev, altitude: parseNumberInput(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Orbit / Class</label>
                        <Input value={editor.orbit || ""} onChange={(e) => setEditor((prev) => ({ ...prev, orbit: e.target.value }))} />
                      </div>
                    </div>
                  ) : null}

                  {editor.kind === "satellite" ? (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Inclination</label>
                      <Input
                        value={editor.inclination ?? ""}
                        onChange={(e) => setEditor((prev) => ({ ...prev, inclination: parseNumberInput(e.target.value) }))}
                      />
                    </div>
                  ) : null}

                  {editor.kind === "missile" ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Target Latitude</label>
                        <Input
                          value={editor.target_lat ?? ""}
                          onChange={(e) => setEditor((prev) => ({ ...prev, target_lat: parseNumberInput(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Target Longitude</label>
                        <Input
                          value={editor.target_lng ?? ""}
                          onChange={(e) => setEditor((prev) => ({ ...prev, target_lng: parseNumberInput(e.target.value) }))}
                        />
                      </div>
                    </div>
                  ) : null}

                  {editor.kind === "conflict" ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Severity</label>
                        <Input value={editor.severity || ""} onChange={(e) => setEditor((prev) => ({ ...prev, severity: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Casualty Level</label>
                        <Input
                          value={editor.casualty_level || ""}
                          onChange={(e) => setEditor((prev) => ({ ...prev, casualty_level: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Details</label>
                    <Textarea value={editor.details || ""} onChange={(e) => setEditor((prev) => ({ ...prev, details: e.target.value }))} rows={4} />
                  </div>

                  {editor.kind === "conflict" ? (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Polygon</label>
                      <Textarea
                        value={polygonText}
                        onChange={(e) => setPolygonText(e.target.value)}
                        rows={5}
                        placeholder={"Each line: lat, lng"}
                      />
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Metadata JSON</label>
                    <Textarea value={metadataText} onChange={(e) => setMetadataText(e.target.value)} rows={6} />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => saveAsset.mutate()} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                      <Save className="mr-2 h-4 w-4" />
                      Save Asset
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openNewEditor(selectedKind)}
                      className="border-border/60 bg-background/80 text-foreground hover:bg-muted"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
