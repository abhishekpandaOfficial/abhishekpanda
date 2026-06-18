import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Shield, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { syncThemeToEmbeddedFrame } from "@/lib/embeddedFrame";
import { supabase } from "@/integrations/supabase/client";
import { buildArgusBridgePayload, fetchOperatorInfo, type ArgusAssetRow, type ArgusOperatorInfo } from "@/lib/argus";

const STATIC_CLASSIFIED_VERSION = "2026-03-09-argus-viii-v2";
const ARGUS_SESSION_KEY = "argus_viii_session_id";
const CLASSIFIED_ACCESS_TOKEN_KEY = "classified_access_token";
const CLASSIFIED_ACCESS_EXPIRES_KEY = "classified_access_expires_at";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

const db = supabase as unknown as {
  from: (table: string) => any;
};

const getArgusSessionId = () => {
  if (typeof window === "undefined") return "argus-server";
  const existing = window.sessionStorage.getItem(ARGUS_SESSION_KEY);
  if (existing) return existing;
  const next = `argus-${crypto.randomUUID()}`;
  window.sessionStorage.setItem(ARGUS_SESSION_KEY, next);
  return next;
};

const hasValidClassifiedAccess = () => {
  if (typeof window === "undefined") return false;
  const token = window.sessionStorage.getItem(CLASSIFIED_ACCESS_TOKEN_KEY);
  const exp = window.sessionStorage.getItem(CLASSIFIED_ACCESS_EXPIRES_KEY);
  if (!token || !exp) return false;
  const ms = new Date(exp).getTime();
  if (!Number.isFinite(ms) || ms <= Date.now()) {
    window.sessionStorage.removeItem(CLASSIFIED_ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(CLASSIFIED_ACCESS_EXPIRES_KEY);
    return false;
  }
  return true;
};

async function invokeEdgeWithFallback<T = any>(functionName: string, body: Record<string, unknown>): Promise<T> {
  const first = await supabase.functions.invoke(functionName, { body });
  if (!first.error) {
    const maybeError = (first.data as { error?: string } | null)?.error;
    if (!maybeError) return first.data as T;
  }

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const rootCause = (first.data as { error?: string } | null)?.error || first.error?.message || "Edge function invoke failed.";
    throw new Error(`${rootCause} Missing Supabase URL/publishable key for fallback call.`);
  }

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  const errText =
    (data as { error?: string })?.error ||
    (first.data as { error?: string } | null)?.error ||
    first.error?.message ||
    `Edge function ${functionName} failed`;
  if (!res.ok || (data as { error?: string })?.error) {
    throw new Error(errText);
  }

  return data as T;
}

const sanitizeGateError = (error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : "";
  if (!message) return fallback;
  const lower = message.toLowerCase();
  if (
    lower.includes("classified-access-") ||
    lower.includes("edge function") ||
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("cors")
  ) {
    return fallback;
  }
  return message;
};

const Classified = () => {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initialThemeRef = useRef(theme);
  const hasLoggedViewRef = useRef(false);
  const [iframeHeight, setIframeHeight] = useState(800);
  const [accessVerified, setAccessVerified] = useState<boolean>(() => hasValidClassifiedAccess());
  const [showAccessGate, setShowAccessGate] = useState(false);
  const [gateStep, setGateStep] = useState<"capture" | "otp">("capture");
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorOtp, setVisitorOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const { data: managedAssets = [] } = useQuery({
    queryKey: ["classified-argus-assets"],
    queryFn: async () => {
      const { data, error } = await db
        .from("argus_assets")
        .select("*")
        .eq("is_active", true)
        .order("kind")
        .order("sort_order")
        .order("name");

      if (error) {
        return [] as ArgusAssetRow[];
      }

      return (data || []) as ArgusAssetRow[];
    },
  });

  const operatorQuery = useQuery({
    queryKey: ["classified-operator-info"],
    queryFn: fetchOperatorInfo,
    retry: 0,
  });

  const operatorInfo = operatorQuery.data as ArgusOperatorInfo | null | undefined;

  useEffect(() => {
    if (accessVerified) return;
    const timer = window.setTimeout(() => {
      setShowAccessGate(true);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [accessVerified]);

  useEffect(() => {
    const calc = () => {
      const headerHeight = window.matchMedia("(min-width: 768px)").matches ? 88 : 80;
      setIframeHeight(window.innerHeight - headerHeight);
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      theme: initialThemeRef.current,
      v: STATIC_CLASSIFIED_VERSION,
    });

    return `/embedded/argus-vii-v3-pro.html?${params.toString()}`;
  }, []);

  const bridgePayload = useMemo(() => {
    const hasAssets = managedAssets.length > 0;
    return buildArgusBridgePayload(hasAssets ? managedAssets : [], operatorInfo || null);
  }, [managedAssets, operatorInfo]);

  const postArgusBridge = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "argus-bridge",
        bridge: {
          operator: bridgePayload.operator,
          ...(managedAssets.length > 0 ? { assets: bridgePayload.assets } : {}),
        },
      },
      window.location.origin,
    );
  };

  useEffect(() => {
    syncThemeToEmbeddedFrame(iframeRef.current, theme);
    postArgusBridge();
  }, [theme, bridgePayload, managedAssets.length]);

  useEffect(() => {
    if (hasLoggedViewRef.current) return;
    if (operatorQuery.status === "pending") return;

    hasLoggedViewRef.current = true;
    const sessionId = getArgusSessionId();
    const operator = operatorInfo || null;

    void db.from("argus_view_events").insert({
      event_type: "classified_view",
      page_path: "/classified",
      session_id: sessionId,
      ip_address: operator?.ip || null,
      city: operator?.city || null,
      region: operator?.region || null,
      country: operator?.country || null,
      isp: operator?.isp || null,
      timezone: operator?.timezone || null,
      latitude: operator?.latitude || null,
      longitude: operator?.longitude || null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
      metadata: {
        source: operator?.source || "unresolved",
        managedAssetCount: managedAssets.length,
        viewport: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : null,
      },
    });
  }, [managedAssets.length, operatorInfo, operatorQuery.status]);

  const operatorSummary = operatorInfo
    ? `${operatorInfo.ip} • ${[operatorInfo.city, operatorInfo.country].filter(Boolean).join(", ")}`
    : "Waiting for user network lookup";

  const sendClassifiedOtp = async () => {
    setGateError(null);
    const name = visitorName.trim();
    const email = visitorEmail.trim().toLowerCase();
    if (!name || !email) {
      setGateError("Please provide your name and email.");
      return;
    }
    setIsSendingOtp(true);
    try {
      await invokeEdgeWithFallback("classified-access-send-otp", {
        name,
        email,
        operator: operatorInfo
          ? {
              ip: operatorInfo.ip,
              city: operatorInfo.city,
              region: operatorInfo.region,
              country: operatorInfo.country,
              isp: operatorInfo.isp,
              timezone: operatorInfo.timezone,
              latitude: operatorInfo.latitude,
              longitude: operatorInfo.longitude,
              source: operatorInfo.source,
            }
          : null,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      setGateStep("otp");
    } catch (e) {
      setGateError(sanitizeGateError(e, "Unable to send OTP right now. Please try again shortly."));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyClassifiedOtp = async () => {
    setGateError(null);
    const name = visitorName.trim();
    const email = visitorEmail.trim().toLowerCase();
    const code = visitorOtp.trim();
    if (!name || !email || !code) {
      setGateError("Please enter name, email and OTP.");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const data = await invokeEdgeWithFallback<{ accessToken?: string; expiresAt?: string }>(
        "classified-access-verify-otp",
        {
          name,
          email,
          code,
          operator: operatorInfo
            ? {
                ip: operatorInfo.ip,
                city: operatorInfo.city,
                region: operatorInfo.region,
                country: operatorInfo.country,
                isp: operatorInfo.isp,
                timezone: operatorInfo.timezone,
                latitude: operatorInfo.latitude,
                longitude: operatorInfo.longitude,
                source: operatorInfo.source,
              }
            : null,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
      );
      const token = (data as { accessToken?: string }).accessToken;
      const expiresAt = (data as { expiresAt?: string }).expiresAt;
      if (!token || !expiresAt) {
        throw new Error("Verification succeeded but access token was missing.");
      }
      window.sessionStorage.setItem(CLASSIFIED_ACCESS_TOKEN_KEY, token);
      window.sessionStorage.setItem(CLASSIFIED_ACCESS_EXPIRES_KEY, expiresAt);
      setAccessVerified(true);
      setShowAccessGate(false);
      setVisitorOtp("");
    } catch (e) {
      setGateError(sanitizeGateError(e, "Unable to verify OTP right now. Please try again shortly."));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen",
        theme === "light" ? "bg-slate-100 text-slate-900" : "bg-slate-950 text-slate-100"
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur",
          theme === "light"
            ? "border-sky-700/15 bg-white/95"
            : "border-cyan-400/20 bg-slate-950/95"
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-4 px-4 md:h-[88px] md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl shadow-[0_0_24px_rgba(34,211,238,0.14)]",
                theme === "light"
                  ? "border border-sky-700/20 bg-sky-100 text-sky-700"
                  : "border border-cyan-300/30 bg-cyan-400/10 text-cyan-200"
              )}
            >
              <Smile className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div
                className={cn(
                  "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.32em]",
                  theme === "light" ? "text-sky-700/80" : "text-cyan-200/80"
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                Classified
              </div>
              <p className={cn("truncate text-sm font-semibold md:text-base", theme === "light" ? "text-slate-900" : "text-white")}>
                ARGUS VIII Preview Surface
              </p>
              <p className={cn("truncate text-xs", theme === "light" ? "text-slate-500" : "text-slate-400")}>{operatorSummary}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              asChild
              variant="outline"
              className={cn(
                theme === "light"
                  ? "border-sky-700/20 bg-white text-slate-900 hover:bg-slate-100"
                  : "border-cyan-400/30 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
              )}
            >
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="overflow-hidden">
        <iframe
          ref={iframeRef}
          title="Classified ARGUS VIII Interface"
          src={iframeSrc}
          className={cn("block w-full border-0 transition", !accessVerified && showAccessGate && "pointer-events-none blur-[1.5px]")}
          style={{ height: iframeHeight }}
          allow="same-origin fullscreen"
          onLoad={() => {
            syncThemeToEmbeddedFrame(iframeRef.current, theme);
            postArgusBridge();
            window.setTimeout(postArgusBridge, 120);
          }}
        />
      </main>

      {!accessVerified && showAccessGate ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/85 px-4">
          <div className="w-full max-w-md rounded-2xl border border-cyan-400/30 bg-slate-950/95 p-6 shadow-[0_0_50px_rgba(34,211,238,0.15)]">
            <div className="mb-5">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-300">Classified Access</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Verify Name + Email With OTP</h2>
              <p className="mt-2 text-sm text-slate-300">
                Access is locked until OTP verification is completed.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classified-name" className="text-slate-200">Name</Label>
                <Input
                  id="classified-name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Your full name"
                  className="border-cyan-400/20 bg-slate-900 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classified-email" className="text-slate-200">Email</Label>
                <Input
                  id="classified-email"
                  type="email"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="border-cyan-400/20 bg-slate-900 text-slate-100"
                />
              </div>
              {gateStep === "otp" ? (
                <div className="space-y-2">
                  <Label htmlFor="classified-otp" className="text-slate-200">OTP</Label>
                  <Input
                    id="classified-otp"
                    inputMode="numeric"
                    maxLength={6}
                    value={visitorOtp}
                    onChange={(e) => setVisitorOtp(e.target.value.replace(/\\D/g, "").slice(0, 6))}
                    placeholder="6-digit OTP"
                    className="border-cyan-400/20 bg-slate-900 text-slate-100"
                  />
                </div>
              ) : null}
            </div>

            {gateError ? <p className="mt-3 text-sm text-rose-300">{gateError}</p> : null}

            <div className="mt-5 flex gap-2">
              {gateStep === "capture" ? (
                <Button className="w-full" onClick={sendClassifiedOtp} disabled={isSendingOtp}>
                  {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="border-cyan-400/30 text-cyan-200" onClick={sendClassifiedOtp} disabled={isSendingOtp}>
                    {isSendingOtp ? "Resending..." : "Resend OTP"}
                  </Button>
                  <Button className="flex-1" onClick={verifyClassifiedOtp} disabled={isVerifyingOtp}>
                    {isVerifyingOtp ? "Verifying..." : "Verify & Unlock"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Classified;
