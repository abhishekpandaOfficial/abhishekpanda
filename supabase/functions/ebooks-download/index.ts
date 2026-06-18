import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders, json, verifyDownloadToken } from "../_shared/ebooks-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const JWT_DOWNLOAD_SECRET = Deno.env.get("JWT_DOWNLOAD_SECRET");
const SITE_URL = (Deno.env.get("SITE_URL") || "https://www.abhishekpanda.com").replace(/\/$/, "");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json(405, { error: "Method not allowed" });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !JWT_DOWNLOAD_SECRET) {
    return json(500, { error: "Missing server configuration" });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";
    const format = (url.searchParams.get("format") || "pdf").toLowerCase();
    if (!token) return json(400, { error: "Missing token" });
    if (format !== "pdf" && format !== "epub") return json(400, { error: "Invalid format" });

    const payload = await verifyDownloadToken(token, JWT_DOWNLOAD_SECRET);
    if (!payload) return json(401, { error: "Invalid or expired token" });

    const email = String(payload.sub || "");
    const ebookSlug = String(payload.ebookSlug || "");
    const jti = String(payload.jti || "");
    if (!email || !ebookSlug || !jti) return json(401, { error: "Invalid token payload" });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: session, error: sessionErr } = await supabase
      .from("ebook_download_sessions")
      .select("id,expires_at")
      .eq("token_jti", jti)
      .eq("email", email)
      .eq("ebook_slug", ebookSlug)
      .maybeSingle();
    if (sessionErr || !session) return json(401, { error: "Session not found" });
    if (new Date(session.expires_at).getTime() < Date.now()) {
      return json(401, { error: "Download session expired" });
    }

    const [{ data: ebook, error: ebookErr }, { data: lead, error: leadErr }] = await Promise.all([
      supabase
        .from("ebooks")
        .select("slug,is_free,is_coming_soon,pdf_url,epub_url")
        .eq("slug", ebookSlug)
        .maybeSingle(),
      supabase
        .from("ebook_lead_captures")
        .select("id")
        .eq("email", email)
        .eq("ebook_slug", ebookSlug)
        .not("verified_at", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (ebookErr || !ebook) return json(404, { error: "Ebook not found" });
    if (leadErr || !lead) return json(403, { error: "Lead not verified" });
    if (!ebook.is_free || ebook.is_coming_soon) return json(403, { error: "Only free published ebooks are downloadable with this token" });

    const rawPath = format === "epub" ? ebook.epub_url : ebook.pdf_url;
    if (!rawPath) return json(404, { error: "Requested file is unavailable" });

    // Single-use token session.
    await supabase.from("ebook_download_sessions").delete().eq("id", session.id);

    const finalUrl = rawPath.startsWith("http://") || rawPath.startsWith("https://")
      ? rawPath
      : `${SITE_URL}${rawPath.startsWith("/") ? rawPath : `/${rawPath}`}`;

    return Response.redirect(finalUrl, 302);
  } catch (error) {
    console.error("ebooks-download error", error);
    return json(500, { error: "Unexpected server error" });
  }
});
