import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getBearerToken = (req: Request) => {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  return auth.slice("bearer ".length).trim();
};

const html = (status: number, body: string) =>
  new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
  });

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

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
  const openapiUrl = `${origin}/functions/v1/ops-openapi`;

  // Uses swagger-ui-dist from CDN. No secrets are embedded.
  return html(
    200,
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ops Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #0b1220; }
      #swagger-ui { max-width: 1100px; margin: 0 auto; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: ${JSON.stringify(openapiUrl)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
        requestInterceptor: (req) => {
          // Keep the same Bearer token as this request when calling ops-openapi / ops-health.
          const auth = ${JSON.stringify(req.headers.get("Authorization") || "")};
          if (auth) req.headers['Authorization'] = auth;
          return req;
        },
      });
    </script>
  </body>
</html>`
  );
};

serve(handler);

