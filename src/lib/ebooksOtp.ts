export const OTP_MAX_ATTEMPTS = 5;

export function normalizeOtp(raw: string): string {
  return raw.replace(/\s+/g, "").trim();
}

export function isOtpFormatValid(raw: string): boolean {
  return /^\d{6}$/.test(normalizeOtp(raw));
}

export function isOtpExpired(expiresAtIso: string, nowMs = Date.now()): boolean {
  const expiresMs = new Date(expiresAtIso).getTime();
  return !Number.isFinite(expiresMs) || expiresMs <= nowMs;
}

export function canAttemptOtp(attempts: number, maxAttempts = OTP_MAX_ATTEMPTS): boolean {
  return attempts < maxAttempts;
}
