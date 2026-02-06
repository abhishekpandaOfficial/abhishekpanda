import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Map, Loader2, AlertTriangle, Globe, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface LoginLocation {
  city: string | null;
  country: string | null;
  ip_address: string | null;
  status: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

// Approximate coordinates for major cities (fallback when geolocation not available)
const cityCoordinates: Record<string, [number, number]> = {
  "New York": [-74.006, 40.7128],
  "Los Angeles": [-118.2437, 34.0522],
  "London": [-0.1276, 51.5074],
  "Paris": [2.3522, 48.8566],
  "Tokyo": [139.6917, 35.6895],
  "Sydney": [151.2093, -33.8688],
  "Mumbai": [72.8777, 19.076],
  "Delhi": [77.1025, 28.7041],
  "Bangalore": [77.5946, 12.9716],
  "Singapore": [103.8198, 1.3521],
  "Dubai": [55.2708, 25.2048],
  "Berlin": [13.405, 52.52],
  "Moscow": [37.6173, 55.7558],
  "Beijing": [116.4074, 39.9042],
  "Shanghai": [121.4737, 31.2304],
  "São Paulo": [-46.6333, -23.5505],
  "Mexico City": [-99.1332, 19.4326],
  "Cairo": [31.2357, 30.0444],
  "Lagos": [3.3792, 6.5244],
  "Johannesburg": [28.0473, -26.2041],
};

// Country center coordinates fallback
const countryCoordinates: Record<string, [number, number]> = {
  "United States": [-95.7129, 37.0902],
  "India": [78.9629, 20.5937],
  "United Kingdom": [-3.436, 55.3781],
  "Germany": [10.4515, 51.1657],
  "France": [2.2137, 46.2276],
  "Japan": [138.2529, 36.2048],
  "Australia": [133.7751, -25.2744],
  "Canada": [-106.3468, 56.1304],
  "Brazil": [-51.9253, -14.235],
  "China": [104.1954, 35.8617],
  "Russia": [105.3188, 61.524],
  "South Africa": [22.9375, -30.5595],
  "UAE": [53.8478, 23.4241],
  "Singapore": [103.8198, 1.3521],
  "Netherlands": [5.2913, 52.1326],
  "Sweden": [18.6435, 60.1282],
};

export const ThreatMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Fetch Mapbox token
  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["mapbox-token"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("mapbox-token");
      if (error) throw error;
      return data as { token: string };
    },
    retry: 1,
  });

  // Fetch login locations
  const { data: locations, isLoading: locationsLoading, refetch } = useQuery({
    queryKey: ["login-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("login_audit_logs")
        .select("city, country, ip_address, status, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as LoginLocation[];
    },
  });

  // Process locations into map markers
  const processedLocations = locations?.map((loc) => {
    let coords: [number, number] | null = null;

    // Try city coordinates first
    if (loc.city && cityCoordinates[loc.city]) {
      coords = cityCoordinates[loc.city];
    } 
    // Fall back to country coordinates
    else if (loc.country && countryCoordinates[loc.country]) {
      coords = countryCoordinates[loc.country];
    }
    // Add some randomness to prevent exact overlaps
    else if (loc.country) {
      // Generate approximate coordinates based on country
      coords = countryCoordinates[loc.country] || [0, 0];
    }

    if (coords) {
      // Add slight randomization to prevent marker overlap
      const jitter = 0.5;
      coords = [
        coords[0] + (Math.random() - 0.5) * jitter,
        coords[1] + (Math.random() - 0.5) * jitter,
      ];
    }

    return {
      ...loc,
      coordinates: coords,
    };
  }).filter((loc) => loc.coordinates);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !tokenData?.token || map.current) return;

    try {
      mapboxgl.accessToken = tokenData.token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 20],
        zoom: 1.5,
        projection: "globe",
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        "top-right"
      );

      map.current.on("style.load", () => {
        map.current?.setFog({
          color: "rgb(30, 30, 50)",
          "high-color": "rgb(50, 50, 80)",
          "horizon-blend": 0.2,
        });
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("Map error:", e);
        setMapError("Failed to load map");
      });

    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [tokenData?.token]);

  // Add markers when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded || !processedLocations) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll(".threat-marker");
    existingMarkers.forEach((m) => m.remove());

    // Group by coordinates for clustering
    const clusters: Record<string, { coords: [number, number]; failed: number; success: number; locations: typeof processedLocations }> = {};

    processedLocations.forEach((loc) => {
      if (!loc.coordinates) return;
      const key = `${Math.round(loc.coordinates[0] * 10)}_${Math.round(loc.coordinates[1] * 10)}`;
      if (!clusters[key]) {
        clusters[key] = { coords: loc.coordinates, failed: 0, success: 0, locations: [] };
      }
      if (loc.status === "failed") {
        clusters[key].failed++;
      } else {
        clusters[key].success++;
      }
      clusters[key].locations.push(loc);
    });

    // Add cluster markers
    Object.values(clusters).forEach((cluster) => {
      const total = cluster.failed + cluster.success;
      const failRate = total > 0 ? cluster.failed / total : 0;
      
      // Determine color based on fail rate
      let color = "#10b981"; // green
      if (failRate > 0.7) color = "#ef4444"; // red
      else if (failRate > 0.4) color = "#f97316"; // orange
      else if (failRate > 0.1) color = "#eab308"; // yellow

      // Size based on count
      const size = Math.min(20 + Math.log(total) * 10, 50);

      const el = document.createElement("div");
      el.className = "threat-marker";
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        opacity: 0.8;
        border: 2px solid rgba(255,255,255,0.3);
        box-shadow: 0 0 ${size/2}px ${color};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${Math.max(10, size/3)}px;
        font-weight: bold;
        color: white;
      `;
      el.textContent = total > 1 ? String(total) : "";

      // Popup content
      const popupContent = `
        <div style="padding: 8px; color: #fff; min-width: 150px;">
          <div style="font-weight: bold; margin-bottom: 4px;">
            ${cluster.locations[0]?.city || cluster.locations[0]?.country || "Unknown"}
          </div>
          <div style="font-size: 12px; opacity: 0.8;">
            Total: ${total} | Failed: ${cluster.failed}
          </div>
          <div style="font-size: 11px; margin-top: 4px; color: ${color};">
            Fail Rate: ${Math.round(failRate * 100)}%
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(popupContent);

      new mapboxgl.Marker(el)
        .setLngLat(cluster.coords)
        .setPopup(popup)
        .addTo(map.current!);
    });

  }, [mapLoaded, processedLocations]);

  const isLoading = tokenLoading || locationsLoading;

  // Stats
  const totalLocations = processedLocations?.length || 0;
  const failedAttempts = processedLocations?.filter(l => l.status === "failed").length || 0;
  const uniqueCountries = new Set(processedLocations?.map(l => l.country).filter(Boolean)).size;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-500" />
            Geographic Threat Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {uniqueCountries} countries
            </Badge>
            <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
              {failedAttempts} threats
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()}>
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[400px] w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading threat map...</span>
              </div>
            </div>
          )}
          
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <AlertTriangle className="w-10 h-10 text-orange-500" />
                <span className="text-sm">{mapError}</span>
                <p className="text-xs">Please configure MAPBOX_PUBLIC_TOKEN</p>
              </div>
            </div>
          )}

          <div ref={mapContainer} className="absolute inset-0" />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border z-10">
            <div className="text-xs font-medium text-foreground mb-2">Threat Level</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">High (&gt;70% fail)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-xs text-muted-foreground">Medium (40-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-muted-foreground">Low (10-40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Normal (&lt;10%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
