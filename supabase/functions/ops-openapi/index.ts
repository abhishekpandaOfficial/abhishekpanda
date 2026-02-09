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
  if (!supabaseUrl || !serviceRoleKey) return json(500, { error: "Missing Supabase env." });

  const token = getBearerToken(req);
  if (!token) return json(401, { error: "Missing Authorization bearer token." });

  const sbAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userRes, error: userErr } = await sbAdmin.auth.getUser(token);
  if (userErr || !userRes?.user) return json(401, { error: "Invalid token." });

  const { data: roleRow } = await sbAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userRes.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) return json(403, { error: "Admin role required." });

  const origin = new URL(req.url).origin;

  const spec = {
    openapi: "3.0.3",
    info: {
      title: "AbhishekPanda Supabase Ops API",
      version: "1.0.0",
      description:
        "Operational endpoints for verifying Supabase Edge Functions + DB wiring. Admin only.",
    },
    servers: [{ url: `${origin}/functions/v1` }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    paths: {
      "/ops-health": {
        post: {
          summary: "Admin health check for DB/buckets/secrets",
          responses: {
            200: { description: "Health payload" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/ops-openapi": {
        post: {
          summary: "This OpenAPI spec",
          responses: { 200: { description: "OpenAPI JSON" } },
        },
      },
      "/ops-swagger": {
        get: {
          summary: "Swagger UI for ops endpoints",
          responses: { 200: { description: "HTML" } },
        },
      },

      // Core product functions (documented at high level)
      "/admin-setup": {
        post: {
          summary: "Create first admin account (one-time setup)",
          requestBody: { required: true },
          responses: { 200: { description: "OK" } },
        },
      },
      "/admin-otp": {
        post: {
          summary: "Send/verify admin OTP",
          requestBody: { required: true },
          responses: { 200: { description: "OK" } },
        },
      },
      "/razorpay": {
        post: {
          summary: "Create/verify payments via Razorpay",
          requestBody: { required: true },
          responses: { 200: { description: "OK" } },
        },
      },
      "/contact-notification": {
        post: {
          summary: "Send contact notifications (Resend)",
          requestBody: { required: true },
          responses: { 200: { description: "OK" } },
        },
      },
      "/security-alert": {
        post: { summary: "Send security alert (Resend/Twilio)", requestBody: { required: true }, responses: { 200: { description: "OK" } } },
      },
      "/new-device-alert": {
        post: { summary: "Send new device alert (Resend/Twilio)", requestBody: { required: true }, responses: { 200: { description: "OK" } } },
      },
      "/location-confirmation": {
        post: { summary: "Location confirmation workflow", requestBody: { required: true }, responses: { 200: { description: "OK" } } },
      },
      "/mapbox-token": {
        post: { summary: "Return Mapbox public token", responses: { 200: { description: "OK" } } },
      },
      "/family-photo-url": {
        post: { summary: "Generate signed URL for family photo bucket", requestBody: { required: true }, responses: { 200: { description: "OK" } } },
      },
      "/cron-executor": {
        post: { summary: "Cron job executor", requestBody: { required: true }, responses: { 200: { description: "OK" } } },
      },
    },
  };

  return json(200, spec);
};

serve(handler);

