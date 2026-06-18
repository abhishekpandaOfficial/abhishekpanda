import test from "node:test";
import assert from "node:assert/strict";
import {
  OTP_MAX_ATTEMPTS,
  canAttemptOtp,
  isOtpExpired,
  isOtpFormatValid,
  normalizeOtp,
} from "../src/lib/ebooksOtp.ts";

test("normalizeOtp removes spaces", () => {
  assert.equal(normalizeOtp(" 12 34 56 "), "123456");
});

test("isOtpFormatValid only accepts 6 digits", () => {
  assert.equal(isOtpFormatValid("123456"), true);
  assert.equal(isOtpFormatValid("12345"), false);
  assert.equal(isOtpFormatValid("12a456"), false);
});

test("canAttemptOtp blocks once max reached", () => {
  assert.equal(canAttemptOtp(OTP_MAX_ATTEMPTS - 1), true);
  assert.equal(canAttemptOtp(OTP_MAX_ATTEMPTS), false);
});

test("isOtpExpired evaluates against current time", () => {
  const now = Date.now();
  assert.equal(isOtpExpired(new Date(now + 60_000).toISOString(), now), false);
  assert.equal(isOtpExpired(new Date(now - 1_000).toISOString(), now), true);
});
