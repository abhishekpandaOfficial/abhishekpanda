// IST is fixed at UTC+05:30 (no DST). Keep conversion explicit to avoid browser locale quirks.

export const IST_OFFSET_MINUTES = 330;

export function istPartsToUtcDate(args: {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
}) {
  const utcMs =
    Date.UTC(args.year, args.month - 1, args.day, args.hour, args.minute, 0) -
    IST_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs);
}

export function formatIst(date: Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
    ...(opts ?? {}),
  }).format(date);
}

