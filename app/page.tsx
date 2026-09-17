"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { WorkflowGraph } from "@/components/workflow-graph";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDot,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { FloatingLabelInput } from "@/components/spectrumui/floating-label-input";
import { AgentSteps } from "@/components/spectrumui/blocks/ai-assistants/agent-steps";
import type { ToolCall } from "@/components/spectrumui/blocks/ai-assistants/types";
import { createClosePrintRun, type ClosePrintRun } from "@/lib/closeprint";
import { illustrativeSnapshots, type MarketSnapshot, type Side } from "@/lib/immediacy";

const assets = [
  { symbol: "RNVDAUSDT", label: "rNVDA" },
  { symbol: "RTSLAUSDT", label: "rTSLA" },
  { symbol: "RQQQUSDT", label: "rQQQ" },
];

const SEEDED_EVENT = "Illustrative demo packet: NVDA reported after the US cash close. Revenue and guidance were described as above expectations, while margin pressure remains the main counter-signal.";
const SEEDED_QUESTION = "NVDA reported after the bell. I have $8k. Should I touch rNVDA before Monday—and why?";

const money = (value: number, digits = 2) => new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const signed = (value: number, suffix = "") => `${value > 0 ? "+" : value < 0 ? "−" : ""}${money(Math.abs(value))}${suffix}`;
const time = (timestamp: number) => timestamp
  ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(timestamp)
  : "illustrative";

function makeRun(snapshot: MarketSnapshot, question = SEEDED_QUESTION, eventPacket = SEEDED_EVENT, side: Side = "buy", notional = 8000) {
  return createClosePrintRun({
    question,
    eventPacket,
    eventSource: eventPacket.trim() === SEEDED_EVENT ? "illustrative" : "user-supplied",
    side,
    notional,
    snapshot,
  });
}

export default function Desk() {
  const reducedMotion = useReducedMotion();
  const [symbol, setSymbol] = useState("RNVDAUSDT");
  const [side, setSide] = useState<Side>("buy");
  const [notional, setNotional] = useState("8000");
  const [question, setQuestion] = useState(SEEDED_QUESTION);
  const [eventPacket, setEventPacket] = useState(SEEDED_EVENT);
  const [snapshot, setSnapshot] = useState<MarketSnapshot>(illustrativeSnapshots.RNVDAUSDT);
  const [run, setRun] = useState<ClosePrintRun>(() => makeRun(illustrativeSnapshots.RNVDAUSDT));
  const [loading, setLoading] = useState(true);
  const [marketError, setMarketError] = useState("");
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [tab, setTab] = useState("brief");

  async function loadMarket(nextSymbol = symbol) {
    setLoading(true);
    setMarketError("");
    try {
      const response = await fetch(`/api/market?symbol=${nextSymbol}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error("Live market data unavailable.");
      setSnapshot(data);
      
    } catch {
      const fallback = illustrativeSnapshots[nextSymbol];
      setSnapshot(fallback);
      
      setMarketError("Live Bitget data is unavailable. Veyra switched to its clearly labelled illustrative book.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/market?symbol=RNVDAUSDT", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Live market data unavailable.");
        return response.json();
      })
      .then((data: MarketSnapshot) => {
        if (!active) return;
        setSnapshot(data);
        setRun(makeRun(data));
      })
      .catch(() => {
        if (!active) return;
        setMarketError("Live Bitget data is unavailable. Veyra switched to its clearly labelled illustrative book.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const parsedNotional = Number(notional);
  const inputError = !Number.isFinite(parsedNotional) || parsedNotional <= 0 || parsedNotional > 1_000_000;
  const draftChanged = useMemo(() => (
    run.question !== question ||
    run.eventPacket !== eventPacket ||
    run.side !== side ||
    run.notional !== parsedNotional ||
    run.snapshot.symbol !== snapshot.symbol ||
    run.snapshot.timestamp !== snapshot.timestamp
  ), [eventPacket, parsedNotional, question, run, side, snapshot]);

  function runClosePrint() {
    if (inputError || loading || !question.trim() || !eventPacket.trim()) return;
    setAnalysisRunning(true);
    setTab("brief");
    window.setTimeout(() => {
      setRun(makeRun(snapshot, question.trim(), eventPacket.trim(), side, parsedNotional));
      setAnalysisRunning(false);
    }, 420);
  }

  function resetDemo() {
    setQuestion(SEEDED_QUESTION);
    setEventPacket(SEEDED_EVENT);
    setSide("buy");
    setNotional("8000");
    const selected = illustrativeSnapshots.RNVDAUSDT;
    setSymbol("RNVDAUSDT");
    setSnapshot(selected);
    setRun(makeRun(selected));
    setMarketError("");
    setTab("brief");
  }

  const { market, event } = run;
  const eventToneLabel = event.tone === "insufficient" ? "INSUFFICIENT" : event.tone.toUpperCase();
  const basisDescription = Math.abs(market.anchorBasisPct) < 0.25
    ? "near the venue anchor"
    : `${signed(market.anchorBasisPct, "%")} versus the venue anchor`;
  const conclusion = run.posture === "WAIT / VERIFY"
    ? `Do not treat the current ${run.snapshot.asset} print as confirmed US cash-market price discovery. The requested size faces ${money(market.spreadBps)} bps spread, ${money(market.impactBps)} bps estimated impact, and is ${basisDescription}. Verify the event against its primary source and reassess when the cash market reopens.`
    : run.posture === "CONDITIONAL / SIZE DOWN"
      ? `The visible book can absorb the request, but the cost of immediacy is material. Treat the weekend move as provisional, reduce the test size, and use the cash open as confirmation rather than assuming the current print survives Monday.`
      : `The requested size fits the visible book with limited modeled impact. The remaining risk is informational: the current rToken print can still re-anchor when the US cash market opens.`;

  const trace: ToolCall[] = [
    { id: "event", name: "extract_event_language", status: analysisRunning ? "running" : "success", result: `${eventToneLabel} language read. ${event.expectationGap}` },
    { id: "session", name: "resolve_two_market_clocks", status: analysisRunning ? "running" : "success", result: `US cash is ${run.snapshot.session}; the ${run.snapshot.asset} venue book is evaluated separately from the latest venue anchor.` },
    { id: "market", name: "read_bitget_public_market", status: run.snapshot.source === "live" ? "success" : "error", result: run.snapshot.source === "live" ? `${run.snapshot.symbol} bid ${money(run.snapshot.bid)}, ask ${money(run.snapshot.ask)} from public Bitget v3 market data.` : "The live request was unavailable. Every fallback market value is labelled illustrative." },
    { id: "book", name: "price_visible_book", status: analysisRunning ? "running" : "success", result: `${money(market.fillRatio * 100)}% visible fill; ${money(market.spreadBps)} bps spread; ${money(market.impactBps)} bps estimated impact.` },
    { id: "reanchor", name: "model_reanchor_sensitivity", status: analysisRunning ? "running" : "success", result: "Three anchor-relative sensitivity cases are shown as modeled references, not forecasts or historical probabilities." },
  ];

  return (
    <div className="desk-shell">
      <a className="skip-link" href="#workbench">Skip to workbench</a>
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Veyra home"><svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true"><path d="M6 8l10 18L26 8M16 26V15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>veyra<span>/</span></a>
        <span className="top-divider" />
        <span className="top-label">CLOSEPRINT DESK</span>
        <nav className="top-nav" aria-label="Primary navigation"><a href="#workflow">Workflow</a><a href="#workbench">Research</a></nav>
        <div className="top-right"><span className="read-only"><ShieldCheck size={14} />Read-only desk</span></div>
      </header>

      <main id="top">
        <section className="workflow-section" id="workflow" aria-labelledby="page-title">
          <div className="workflow-toolbar">
            <div><p className="eyebrow">VEYRA / RESEARCH WORKFLOW</p><h1 id="page-title">From event to informed decision.</h1></div>
            <div className="workflow-actions"><span role="status">{analysisRunning ? "Recalculating brief…" : draftChanged ? "Inputs changed · run to update" : "Brief ready to inspect"}</span><motion.div whileTap={reducedMotion ? {} : { scale: .96 }}><Button className="run-button" onClick={runClosePrint} disabled={inputError || loading || analysisRunning || !question.trim() || !eventPacket.trim()}>{analysisRunning ? <RefreshCw size={16} className="spin" /> : <ArrowRight size={16} />}{analysisRunning ? "Building brief…" : "Run brief"}</Button></motion.div></div>
          </div>
          <WorkflowGraph run={run} running={analysisRunning} />
        </section>

        <section className="workbench" id="workbench" aria-label="Veyra ClosePrint workbench">
          <Card className="input-panel">
            <div className="section-heading"><span><Terminal size={16} />Research request</span><button type="button" className="text-button" onClick={resetDemo}>Reset demo</button></div>
            <div className="input-body">
              <div className="field-group"><label className="field-label" htmlFor="research-question">Question</label><Textarea id="research-question" value={question} onChange={(eventValue) => setQuestion(eventValue.target.value)} rows={3} /></div>
              <div className="field-group"><div className="field-line"><label className="field-label" htmlFor="event-packet">Event packet</label><span>{eventPacket.trim() === SEEDED_EVENT ? "Illustrative" : "User supplied"}</span></div><Textarea id="event-packet" value={eventPacket} onChange={(eventValue) => setEventPacket(eventValue.target.value)} rows={5} /><p className="hint">Paste a sourced earnings or news summary. The demo packet is illustrative and never presented as observed evidence.</p></div>
              <div className="field-group"><div className="field-line"><span className="field-label">rToken</span><span>Bitget spot</span></div><div className="asset-grid">{assets.map((item) => <Button key={item.symbol} variant={symbol === item.symbol ? "default" : "outline"} onClick={() => { setSymbol(item.symbol); void loadMarket(item.symbol); }}>{item.label}</Button>)}</div></div>
              <div className="trade-row"><div><span className="field-label">Research side</span><div className="side-grid"><Button variant={side === "buy" ? "default" : "outline"} onClick={() => setSide("buy")}>Buy-side</Button><Button variant={side === "sell" ? "default" : "outline"} onClick={() => setSide("sell")}>Sell-side</Button></div></div><div className="size-input"><FloatingLabelInput id="order-size" label="Size (USDT)" type="number" min={1} max={1000000} step="any" value={notional} onChange={(eventValue) => setNotional(eventValue.target.value)} /></div></div>
              {inputError ? <p className="error" role="alert">Use a size from 1 to 1,000,000 USDT.</p> : null}
              {!question.trim() || !eventPacket.trim() ? <p className="error" role="alert">Question and event packet are required.</p> : null}
              <Button className="run-button" onClick={runClosePrint} disabled={inputError || loading || analysisRunning || !question.trim() || !eventPacket.trim()}>{analysisRunning ? "Building ClosePrint…" : "Run ClosePrint"}<ArrowRight size={16} /></Button>
              <div className="run-meta"><span><ShieldCheck size={13} />No order route</span>{draftChanged ? <span className="draft-status"><CircleDot size={12} />Draft changed</span> : <span><Check size={13} />Brief current</span>}</div>
            </div>
          </Card>

          <motion.div className="result-panel" aria-live="polite" initial={false} animate={{ opacity: analysisRunning ? .55 : 1, y: analysisRunning && !reducedMotion ? 4 : 0 }} transition={{ duration: reducedMotion ? 0 : .22 }}>
            <div className="result-commandbar"><div><span className={`source-pill ${run.snapshot.source}`}>{run.snapshot.source === "live" ? "LIVE BITGET" : "ILLUSTRATIVE BOOK"}</span><span className="timestamp">Snapshot {time(run.snapshot.timestamp)}</span></div><Button variant="outline" size="sm" onClick={() => loadMarket(symbol)} disabled={loading}><RefreshCw size={13} className={loading ? "spin" : ""} />{loading ? "Refreshing" : "Refresh"}</Button></div>
            {marketError ? <p className="stale-note" role="status">{marketError}</p> : null}
            <Tabs value={tab} onValueChange={setTab}>
              <div className="result-nav"><TabsList><TabsTrigger value="brief">Decision brief</TabsTrigger><TabsTrigger value="book">Book math</TabsTrigger><TabsTrigger value="evidence">Provenance</TabsTrigger></TabsList></div>
              <TabsContent value="brief">
                <Card className="memo-card">
                  <div className="memo-head"><div><p className="eyebrow">CLOSEPRINT / {run.snapshot.asset}</p><div className="posture">{run.posture}</div></div><div className={`session-badge ${run.snapshot.session}`}><span />US cash {run.snapshot.session}</div></div>
                  <div className="insight-block"><span>ACTIONABLE INSIGHT</span><p>{conclusion}</p></div>
                  <div className="memo-grid">
                    <section className="memo-section"><div className="memo-section-title"><span>01</span><h2>Event read</h2><small>{eventToneLabel}</small></div><dl className="memo-list"><div><dt>Headline</dt><dd>{event.headline}</dd></div><div><dt>Gap</dt><dd>{event.expectationGap}</dd></div><div><dt>Counter</dt><dd>{event.counterSignal}</dd></div></dl></section>
                    <section className="memo-section"><div className="memo-section-title"><span>02</span><h2>Two market clocks</h2><small>SESSION MODEL</small></div><div className="clock-pair"><div><span>US cash reference</span><strong>{run.snapshot.session === "closed" ? "CLOSED / ANCHORED" : "OPEN"}</strong><small>{money(run.snapshot.anchor)} venue anchor</small></div><div><span>{run.snapshot.asset} book</span><strong>{run.snapshot.source === "live" ? "LIVE" : "ILLUSTRATIVE"}</strong><small>{money(market.mid)} current mid</small></div></div></section>
                    <section className="memo-section memo-section-wide"><div className="memo-section-title"><span>03</span><h2>Cost of immediacy</h2><small>DETERMINISTIC</small></div><div className="metric-grid"><div><span>Book vs anchor</span><strong>{signed(market.anchorBasisPct, "%")}</strong><small>already reflected</small></div><div><span>Quoted spread</span><strong>{money(market.spreadBps)} bps</strong><small>bid to ask</small></div><div><span>Estimated impact</span><strong>{money(market.impactBps)} bps</strong><small>{money(market.fillRatio * 100)}% visible fill</small></div></div></section>
                    <section className="memo-section memo-section-wide"><div className="memo-section-title"><span>04</span><h2>Monday sensitivity</h2><small>MODELED · NOT HISTORY</small></div><div className="scenario-row">{market.scenarios.map((scenario) => <div key={scenario.move}><span>{signed(scenario.move, "%")} anchor case</span><strong>{money(scenario.price)}</strong><small>{signed(scenario.versusNow)} vs estimated fill</small></div>)}</div><p className="boundary-note">No historical probability is claimed. These cases simply expose how the current estimated fill compares with a lower, flat, or higher cash-market re-anchor.</p></section>
                    <section className="memo-section memo-section-wide invalidation"><div className="memo-section-title"><span>05</span><h2>What changes the conclusion</h2><small>INVALIDATION</small></div><p>A primary-source event packet with a verified consensus baseline, a materially tighter visible book, or a US cash open that confirms the weekend move.</p></section>
                  </div>
                  <div className="human-gate"><ShieldCheck size={16} /><div><strong>Human decision required</strong><span>Veyra exposes evidence and constraints. It cannot place an order.</span></div></div>
                </Card>
              </TabsContent>
              <TabsContent value="book"><Card className="book-card"><div className="book-summary"><div><span>Requested</span><strong>{money(run.notional)} USDT</strong></div><div><span>Estimated average</span><strong>{money(market.averageFill)}</strong></div><div><span>Visible book cost</span><strong>{money(market.estimatedBookCost)} USDT</strong></div></div><div className="table-wrap"><Table><TableHeader><TableRow><TableHead>Level</TableHead><TableHead className="numeric">Price</TableHead><TableHead className="numeric">Quantity used</TableHead><TableHead className="numeric">Notional</TableHead></TableRow></TableHeader><TableBody>{market.fills.map((fill, index) => <TableRow key={`${fill.price}-${index}`}><TableCell className="muted">{String(index + 1).padStart(2, "0")}</TableCell><TableCell className="numeric">{money(fill.price)}</TableCell><TableCell className="numeric">{money(fill.quantity, 4)}</TableCell><TableCell className="numeric">{money(fill.notional)}</TableCell></TableRow>)}</TableBody></Table></div></Card></TabsContent>
              <TabsContent value="evidence"><Card className="evidence-card"><p className="eyebrow">PROVENANCE / BOUNDARIES</p><h2>Every number says what it is.</h2><dl><dt>Event layer <span>{run.eventSource}</span></dt><dd>{run.eventSource === "illustrative" ? "A seeded demonstration packet. Replace it with a primary-source excerpt before making a live claim." : "Text supplied by the user. Deterministic keyword extraction identifies language; it does not verify the source."}</dd><dt>Market layer <span>{run.snapshot.source}</span></dt><dd>{run.snapshot.source === "live" ? `Public Bitget v3 ticker and visible order book for ${run.snapshot.symbol}, timestamped ${time(run.snapshot.timestamp)}.` : "A fixed illustrative fallback book used only when the public Bitget request is unavailable."}</dd><dt>Anchor layer <span>derived</span></dt><dd>The close of the latest completed 3–4 PM New York hourly rToken candle: {money(run.snapshot.anchor)} at {time(run.snapshot.anchorTimestamp)}. It is a venue anchor, not an official underlying-stock close.</dd><dt>Scenario layer <span>modeled</span></dt><dd>−3%, 0%, and +3% sensitivity around the venue anchor. These are not historical observations, probabilities, or price forecasts.</dd><dt>Current limitations <span>excluded</span></dt><dd>No external LLM, transcript verification, historical analogue database, account balances, hidden liquidity, fees, taxes, issuer redemption, or execution.</dd></dl></Card></TabsContent>
            </Tabs>
          </motion.div>
        </section>

        <details className="trace-section"><summary>Inspect calculation trace</summary><div className="trace-layout">
          <div className="section-intro"><p className="eyebrow">AUDITABLE RESEARCH RUN</p><h2 id="trace-title">One question. Five visible checks.</h2><p>The workflow stays inspectable: inputs, source status, calculations, boundaries and conclusion remain separate.</p></div>
          <Card className="trace-card"><div className="trace-head"><span><ScanSearch size={16} />Run trace</span><span className="source-pill rules">RULE ENGINE</span></div><div className="trace-body"><AgentSteps steps={trace} /></div><div className="trace-foot"><CheckCircle2 size={15} /><span>Research object completed</span><small>No external model call required</small></div></Card>
        </div></details>

        <footer><span>VEYRA / CLOSEPRINT DESK</span><span>Observed · derived · modeled · illustrative</span><span>No login. No execution.</span></footer>
      </main>
    </div>
  );
}
