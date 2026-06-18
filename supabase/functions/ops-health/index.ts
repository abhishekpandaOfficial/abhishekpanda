import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const getBearerToken = (req: Request) => {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  return auth.slice("bearer ".length).trim();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { ok: false, error: "Missing Supabase env." });
  }

  const token = getBearerToken(req);
  if (!token) return json(401, { ok: false, error: "Missing Authorization bearer token." });

  const sbAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verify caller and admin role.
  const { data: userRes, error: userErr } = await sbAdmin.auth.getUser(token);
  if (userErr || !userRes?.user) return json(401, { ok: false, error: "Invalid token." });

  const { data: roleRow } = await sbAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userRes.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) return json(403, { ok: false, error: "Admin role required." });

  const checks: Record<string, unknown> = {};
  const startedAt = Date.now();

  // DB checks (table existence + RLS read path).
  const checkSelect = async (table: string) => {
    try {
      const res = await sbAdmin.from(table).select("*").limit(1);
      if (res.error) throw res.error;
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: msg };
    }
  };

  checks.blog_posts = await checkSelect("blog_posts");
  checks.blog_posts_public_cache = await checkSelect("blog_posts_public_cache");
  checks.user_entitlements = await checkSelect("user_entitlements");

  // Storage bucket presence (service role can read storage.buckets).
  try {
    const { data, error } = await sbAdmin
      .schema("storage")
      .from("buckets")
      .select("id,public")
      .in("id", ["blog-assets", "products", "family-photos"]);
    if (error) throw error;
    checks.storage_buckets = {
      ok: true,
      buckets: (data ?? []).map((b) => ({ id: b.id, public: b.public })),
    };
  } catch (e) {
    checks.storage_buckets = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // Secret presence (do NOT return values).
  checks.secrets = {
    RESEND_API_KEY: !!Deno.env.get("RESEND_API_KEY"),
    MAPBOX_PUBLIC_TOKEN: !!Deno.env.get("MAPBOX_PUBLIC_TOKEN"),
    RAZORPAY_KEY_ID: !!Deno.env.get("RAZORPAY_KEY_ID"),
    RAZORPAY_KEY_SECRET: !!Deno.env.get("RAZORPAY_KEY_SECRET"),
    TWILIO_ACCOUNT_SID: !!Deno.env.get("TWILIO_ACCOUNT_SID"),
    TWILIO_AUTH_TOKEN: !!Deno.env.get("TWILIO_AUTH_TOKEN"),
    TWILIO_PHONE_NUMBER: !!Deno.env.get("TWILIO_PHONE_NUMBER"),
    ADMIN_PHONE_NUMBER: !!Deno.env.get("ADMIN_PHONE_NUMBER"),
    ADMIN_EMAIL: !!Deno.env.get("ADMIN_EMAIL"),
  };

  const elapsedMs = Date.now() - startedAt;
  const ok =
    (checks.blog_posts as any)?.ok &&
    (checks.blog_posts_public_cache as any)?.ok &&
    (checks.user_entitlements as any)?.ok;

  return json(200, {
    ok: !!ok,
    timestamp: new Date().toISOString(),
    elapsed_ms: elapsedMs,
    checks,
  });
};

serve(handler);

