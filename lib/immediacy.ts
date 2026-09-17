export type Side = "buy" | "sell";
export type Level = [number, number];
export type MarketSnapshot = {
  symbol: string; asset: string; bid: number; ask: number; last: number;
  bidSize: number; askSize: number; change24h: number; turnover24h: number;
  platformTurnover24h: number; timestamp: number; anchor: number;
  anchorTimestamp: number; bids: Level[]; asks: Level[];
  session: "open" | "closed"; source: "live" | "illustrative"; sessionBasis?: string;
};
const positive = (value: number) => Number.isFinite(value) && value > 0;

export function priceImmediacy(snapshot: MarketSnapshot, notional: number, side: Side) {
  if (!positive(notional) || notional > 1_000_000) throw new Error("Enter an order size between 1 and 1,000,000 USDT.");
  if (![snapshot.bid, snapshot.ask, snapshot.anchor].every(positive)) throw new Error("The market snapshot is missing a valid price.");
  const mid = (snapshot.bid + snapshot.ask) / 2;
  const spreadBps = ((snapshot.ask - snapshot.bid) / mid) * 10_000;
  if (snapshot.ask < snapshot.bid) throw new Error("The order book is crossed; refresh the snapshot.");
  const levels = [...(side === "buy" ? snapshot.asks : snapshot.bids)].filter(([p,q]) => positive(p) && positive(q)).sort((a,b) => side === "buy" ? a[0] - b[0] : b[0] - a[0]);
  let remaining = notional, filledNotional = 0, filledQuantity = 0;
  const fills: Array<{ price: number; quantity: number; notional: number }> = [];
  for (const [price, quantity] of levels) {
    if (!positive(price) || !positive(quantity) || remaining <= 0) continue;
    const takeNotional = Math.min(remaining, price * quantity);
    const takeQuantity = takeNotional / price;
    fills.push({ price, quantity: takeQuantity, notional: takeNotional });
    filledNotional += takeNotional; filledQuantity += takeQuantity; remaining -= takeNotional;
  }
  const averageFill = filledQuantity ? filledNotional / filledQuantity : 0;
  const fillRatio = Math.min(1, filledNotional / notional);
  const direction = side === "buy" ? 1 : -1;
  const impactBps = averageFill ? direction * ((averageFill - mid) / mid) * 10_000 : 0;
  const anchorBasisPct = ((mid - snapshot.anchor) / snapshot.anchor) * 100;
  const executionVsAnchorPct = averageFill ? direction * ((averageFill - snapshot.anchor) / snapshot.anchor) * 100 : 0;
  const nearBand = side === "buy" ? mid * 1.0025 : mid * 0.9975;
  const depth25bps = levels.reduce((sum, [price, quantity]) => {
    const inside = side === "buy" ? price <= nearBand : price >= nearBand;
    return inside ? sum + price * quantity : sum;
  }, 0);
  const estimatedBookCost = averageFill ? Math.abs(averageFill - mid) * filledQuantity : 0;
  let posture: "WAIT" | "SIZE TEST" | "BOOK SUPPORTS SIZE" = "BOOK SUPPORTS SIZE";
  let rationale = "The requested size fits the visible book without a large quoted premium.";
  if (fillRatio < 0.999) {
    posture = "WAIT"; rationale = "The visible book cannot fill the requested size. Waiting or splitting the order avoids blind market impact.";
  } else if (spreadBps >= 25 || impactBps >= 35) {
    posture = "WAIT"; rationale = "Spread or modeled impact exceeds the desk's illustrative research threshold.";
  } else if (spreadBps >= 10 || impactBps >= 15 || notional > depth25bps) {
    posture = "SIZE TEST"; rationale = "The request fits, but spread, impact or shallow depth warrants comparing a smaller size.";
  }
  const scenarios = [-3, 0, 3].map((move) => ({ move, price: snapshot.anchor * (1 + move / 100), versusNow: snapshot.anchor * (1 + move / 100) - averageFill }));
  return { mid, spreadBps, averageFill, filledNotional, fillRatio, impactBps, anchorBasisPct, executionVsAnchorPct, depth25bps, estimatedBookCost, posture, rationale, fills, scenarios };
}

export const illustrativeSnapshots: Record<string, MarketSnapshot> = {
  RNVDAUSDT: { symbol:"RNVDAUSDT",asset:"rNVDA",bid:181.06,ask:181.22,last:181.14,bidSize:4.2,askSize:3.8,change24h:.74,turnover24h:164300,platformTurnover24h:164300,timestamp:0,anchor:179.84,anchorTimestamp:0,bids:[[181.06,4.2],[180.98,8.5],[180.82,14],[180.55,25],[180.1,40]],asks:[[181.22,3.8],[181.31,7.2],[181.48,12],[181.75,20],[182.2,35]],session:"closed",source:"illustrative" },
  RTSLAUSDT: { symbol:"RTSLAUSDT",asset:"rTSLA",bid:402.1,ask:402.65,last:402.4,bidSize:1.5,askSize:1.2,change24h:1.12,turnover24h:121800,platformTurnover24h:121800,timestamp:0,anchor:397.9,anchorTimestamp:0,bids:[[402.1,1.5],[401.8,2.2],[401.2,4],[400.4,7],[399.5,10]],asks:[[402.65,1.2],[403.1,2],[403.8,3.5],[404.7,6],[406,9]],session:"closed",source:"illustrative" },
  RQQQUSDT: { symbol:"RQQQUSDT",asset:"rQQQ",bid:601.12,ask:601.46,last:601.31,bidSize:2.8,askSize:2.4,change24h:.38,turnover24h:96500,platformTurnover24h:96500,timestamp:0,anchor:599.2,anchorTimestamp:0,bids:[[601.12,2.8],[600.9,4.2],[600.55,7],[600.1,12],[599.4,18]],asks:[[601.46,2.4],[601.72,4],[602.05,6.5],[602.6,10],[603.5,16]],session:"closed",source:"illustrative" },
};
