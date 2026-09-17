import type { MarketSnapshot, Side } from "@/lib/immediacy";
import { priceImmediacy } from "@/lib/immediacy";

export type EventTone = "positive" | "mixed" | "negative" | "insufficient";

export type EventRead = {
  tone: EventTone;
  headline: string;
  expectationGap: string;
  counterSignal: string;
  matchedSignals: string[];
};

export type ClosePrintRun = {
  question: string;
  eventPacket: string;
  eventSource: "illustrative" | "user-supplied";
  side: Side;
  notional: number;
  snapshot: MarketSnapshot;
  event: EventRead;
  market: ReturnType<typeof priceImmediacy>;
  posture: "WAIT / VERIFY" | "CONDITIONAL / SIZE DOWN" | "BOOK SUPPORTS SIZE";
  completedAt: number;
};

const POSITIVE_SIGNALS = [
  "above expectations",
  "beat",
  "raised",
  "strong demand",
  "accelerating",
  "record",
  "upside",
  "improved",
];

const NEGATIVE_SIGNALS = [
  "below expectations",
  "miss",
  "cut",
  "weak",
  "slower",
  "decline",
  "pressure",
  "margin",
];

function matches(text: string, terms: string[]) {
  return terms.filter((term) => text.includes(term));
}

export function extractEventRead(packet: string): EventRead {
  const normalized = packet.toLowerCase().trim();
  if (normalized.length < 24) {
    return {
      tone: "insufficient",
      headline: "The event packet is too short for a defensible directional read.",
      expectationGap: "Add the reported result, the prior expectation, and management guidance.",
      counterSignal: "No counter-signal can be identified from the supplied text.",
      matchedSignals: [],
    };
  }

  const positive = matches(normalized, POSITIVE_SIGNALS);
  const negative = matches(normalized, NEGATIVE_SIGNALS);
  const tone: EventTone = positive.length > 0 && negative.length > 0
    ? "mixed"
    : positive.length > 0
      ? "positive"
      : negative.length > 0
        ? "negative"
        : "mixed";

  const headline =
    tone === "positive" ? "The supplied event text has a positive headline skew." :
      tone === "negative" ? "The supplied event text has a negative headline skew." :
        "The supplied event text is mixed rather than directionally clean.";

  const expectationGap =
    positive.includes("above expectations") || positive.includes("beat")
      ? "The packet explicitly describes a result above prior expectations. Veyra does not invent the missing consensus value."
      : negative.includes("below expectations") || negative.includes("miss")
        ? "The packet explicitly describes a result below prior expectations. Veyra does not invent the missing consensus value."
        : "No numeric consensus baseline is present, so the size of the expectation gap remains unverified.";

  const counterSignal = negative.length
    ? `Risk language detected: ${negative.slice(0, 3).join(", ")}. Confirm it against the original filing or call.`
    : "No clear counter-signal was found in the supplied text; that absence is not evidence that one does not exist.";

  return {
    tone,
    headline,
    expectationGap,
    counterSignal,
    matchedSignals: [...positive, ...negative].slice(0, 6),
  };
}

export function createClosePrintRun(input: {
  question: string;
  eventPacket: string;
  eventSource: ClosePrintRun["eventSource"];
  side: Side;
  notional: number;
  snapshot: MarketSnapshot;
}): ClosePrintRun {
  const market = priceImmediacy(input.snapshot, input.notional, input.side);
  const posture = market.posture === "WAIT"
    ? "WAIT / VERIFY"
    : market.posture === "SIZE TEST"
      ? "CONDITIONAL / SIZE DOWN"
      : "BOOK SUPPORTS SIZE";

  return {
    ...input,
    event: extractEventRead(input.eventPacket),
    market,
    posture,
    completedAt: Date.now(),
  };
}
