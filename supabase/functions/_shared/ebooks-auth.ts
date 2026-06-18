export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

export const getClientIp = (req: Request): string =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("cf-connecting-ip") ||
  "unknown";

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidMobile = (mobile: string): boolean =>
  /^\+?[0-9][0-9\s\-()]{7,20}$/.test(mobile);

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

const enc = new TextEncoder();

export async function sha256Hex(value: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(value));
  const bytes = new Uint8Array(hashBuffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function randomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashOtp(otp: string): Promise<string> {
  const salt = randomHex(16);
  const digest = await sha256Hex(`${salt}:${otp}`);
  return `${salt}:${digest}`;
}

export async function verifyOtpHash(otp: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, expected] = parts;
  const actual = await sha256Hex(`${salt}:${otp}`);
  return timingSafeEqual(expected, actual);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function base64url(input: Uint8Array): string {
  const base = btoa(String.fromCharCode(...input));
  return base.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromUtf8(text: string): Uint8Array {
  return enc.encode(text);
}

export async function signDownloadToken(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64url(fromUtf8(JSON.stringify(header)));
  const payloadB64 = base64url(fromUtf8(JSON.stringify(payload)));
  const data = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    fromUtf8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, fromUtf8(data)));
  return `${data}.${base64url(signature)}`;
}

export async function verifyDownloadToken(
  token: string,
  secret: string,
): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const signature = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
  const signatureBinary = atob(signature + "=".repeat((4 - (signature.length % 4)) % 4));
  const sigBytes = Uint8Array.from(signatureBinary, (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "raw",
    fromUtf8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, fromUtf8(data));
  if (!isValid) return null;

  try {
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    const exp = Number(payload.exp);
    if (!Number.isFinite(exp) || Date.now() >= exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
