import { useCallback, useEffect, useMemo, useState } from "react";
import { RedocStandalone } from "redoc";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "loaded"; spec: Record<string, unknown> }
  | { status: "error"; message: string };

export default function AdminOpsDocs() {
  const [state, setState] = useState<LoadState>({ status: "idle" });

  const loadSpec = useCallback(async () => {
    setState({ status: "loading" });

    const { data, error } = await supabase.functions.invoke("ops-openapi", {
      // Our edge function does not require a request body; invoke uses POST by default.
      body: {},
    });

    if (error) {
      setState({ status: "error", message: error.message });
      return;
    }

    if (!data || typeof data !== "object") {
      setState({ status: "error", message: "Invalid OpenAPI payload." });
      return;
    }

    setState({ status: "loaded", spec: data as Record<string, unknown> });
  }, []);

  useEffect(() => {
    loadSpec();
  }, [loadSpec]);

  const header = useMemo(() => {
    if (state.status === "error") {
      return (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <ShieldAlert className="h-5 w-5 text-red-400" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-red-200">Failed to load OpenAPI spec</div>
            <div className="mt-1 break-words text-xs text-red-200/80">{state.message}</div>
          </div>
        </div>
      );
    }

    return null;
  }, [state]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-white">Ops API Docs</div>
          <div className="text-xs text-slate-300">
            Admin-only OpenAPI docs rendered via Redoc (read-only).
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadSpec}
            disabled={state.status === "loading"}
          >
            {state.status === "loading" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {header}

      <Card className="overflow-hidden border-white/10 bg-white/[0.04]">
        {state.status !== "loaded" ? (
          <div className="flex min-h-[480px] items-center justify-center p-8 text-slate-200">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading OpenAPI spec...
          </div>
        ) : (
          <div className="bg-white">
            <RedocStandalone
              spec={state.spec}
              options={{
                hideDownloadButton: false,
                nativeScrollbars: true,
                theme: {
                  colors: { primary: { main: "#111827" } },
                  typography: { fontSize: "14px", fontFamily: "ui-sans-serif, system-ui" },
                },
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
