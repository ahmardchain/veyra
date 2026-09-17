// Scheduled US cash sessions. Source: https://www.nyse.com/trade/hours-calendars
// Coverage is explicit; unscheduled halts and closures require a live calendar feed.
const holidays = new Set([
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31", "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
  "2028-01-17", "2028-02-21", "2028-04-14", "2028-05-29", "2028-06-19", "2028-07-04", "2028-09-04", "2028-11-23", "2028-12-25",
]);
const earlyCloses = new Set(["2026-11-27", "2026-12-24", "2027-11-26", "2028-07-03", "2028-11-24"]);
export function nyParts(timestamp: number) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(timestamp);
  const read = (type: string) => parts.find(p => p.type === type)?.value ?? "";
  return { date: `${read("year")}-${read("month")}-${read("day")}`, year: Number(read("year")), weekday: read("weekday"), hour: Number(read("hour")), minute: Number(read("minute")) };
}
export function sessionAt(timestamp: number) {
  const p = nyParts(timestamp);
  const covered = p.year >= 2026 && p.year <= 2028;
  const tradingDay = !["Sat", "Sun"].includes(p.weekday) && !holidays.has(p.date);
  const closeHour = earlyCloses.has(p.date) ? 13 : 16;
  const minutes = p.hour * 60 + p.minute;
  return { session: tradingDay && minutes >= 570 && minutes < closeHour * 60 ? "open" as const : "closed" as const, closeHour, tradingDay, basis: covered ? "NYSE published 2026–2028 schedule; excludes unscheduled halts" : "Weekday schedule estimate; holiday calendar out of coverage" };
}
export function completedVenueAnchor(candles: Array<Array<string | number>>, now: number) {
  const candle = [...candles].sort((a,b) => Number(b[0]) - Number(a[0])).find(row => {
    const start = Number(row[0]);
    const day = sessionAt(start);
    return Number.isFinite(start) && start + 3_600_000 <= now && day.tradingDay && nyParts(start).hour === day.closeHour - 1 && Number(row[4]) > 0;
  });
  if (!candle) throw new Error("No completed cash-session venue anchor is available.");
  return { price: Number(candle[4]), timestamp: Number(candle[0]) + 3_600_000 };
}
