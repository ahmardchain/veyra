"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, BookOpen, Braces, Check, ChevronRight, Clock3, FileSearch, FlaskConical, RefreshCw, ScanSearch, ShieldCheck, Sparkles, Terminal, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { FloatingLabelInput } from "@/components/spectrumui/floating-label-input";
import { AgentSteps } from "@/components/spectrumui/blocks/ai-assistants/agent-steps";
import type { ToolCall } from "@/components/spectrumui/blocks/ai-assistants/types";
import { illustrativeSnapshots, priceImmediacy, type MarketSnapshot, type Side } from "@/lib/immediacy";

const assets = [{ symbol: "RNVDAUSDT", label: "rNVDA" }, { symbol: "RTSLAUSDT", label: "rTSLA" }, { symbol: "RQQQUSDT", label: "rQQQ" }];
const SEEDED_EVENT = "Illustrative demo packet: NVDA reported after the US cash close. The supplied brief describes revenue and guidance above expectations, while margin commentary remains the main counter-signal.";
const money = (value: number, digits = 2) => new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const compact = (value: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
const signed = (value: number, suffix = "") => `${value > 0 ? "+" : value < 0 ? "−" : ""}${money(Math.abs(value))}${suffix}`;
const time = (timestamp: number) => timestamp ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(timestamp) : "illustrative";

export default function Desk() {
  const [symbol, setSymbol] = useState("RNVDAUSDT");
  const [side, setSide] = useState<Side>("buy");
  const [notional, setNotional] = useState("8000");
  const [question, setQuestion] = useState("NVDA reported after the bell. I have $8k. Should I touch rNVDA before Monday—and why?");
  const [eventPacket, setEventPacket] = useState(SEEDED_EVENT);
  const [snapshot, setSnapshot] = useState<MarketSnapshot>(illustrativeSnapshots.RNVDAUSDT);
  const [loading, setLoading] = useState(true);
  const [marketError, setMarketError] = useState("");
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [hasRun, setHasRun] = useState(true);
  const [tab, setTab] = useState("memo");
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  async function loadMarket(nextSymbol = symbol) {
    setLoading(true); setMarketError("");
    try {
      const response = await fetch(`/api/market?symbol=${nextSymbol}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error("Live market data unavailable.");
      setSnapshot(data);
    } catch {
      setSnapshot(illustrativeSnapshots[nextSymbol]);
      setMarketError("Live Bitget data is unavailable in this preview. The market panel below is explicitly illustrative.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadMarket(symbol); }, [symbol]);
  const parsedNotional = Number(notional);
  const inputError = !Number.isFinite(parsedNotional) || parsedNotional <= 0 || parsedNotional > 1_000_000;
  const result = useMemo(() => { try { return priceImmediacy(snapshot, parsedNotional, side); } catch { return priceImmediacy(snapshot, 8000, side); } }, [snapshot, parsedNotional, side]);
  const seededExtraction = eventPacket.trim() === SEEDED_EVENT;
  const researchPosture = result.posture === "WAIT" ? "WAIT / VERIFY AT CASH OPEN" : result.posture === "SIZE TEST" ? "CONDITIONAL / SIZE DOWN" : "BOOK CAN SUPPORT SIZE";

  function runClosePrint() {
    if (inputError || loading) return;
    setAnalysisRunning(true); setHasRun(false); setTab("memo");
    window.setTimeout(() => { setAnalysisRunning(false); setHasRun(true); }, 520);
  }

  async function askQwen() {
    setAiLoading(true); setAiError(""); setAiText("");
    try {
      const response = await fetch("/api/research", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
        question, eventPacket, eventSource: seededExtraction ? "illustrative demo packet" : "user supplied", asset: snapshot.asset, side, notional: parsedNotional, source: snapshot.source, session: snapshot.session,
        metrics: { researchPosture, spreadBps: result.spreadBps, impactBps: result.impactBps, anchorBasisPct: result.anchorBasisPct, fillRatio: result.fillRatio },
      }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Qwen request failed.");
      setAiText(data.output);
    } catch (error) { setAiError(error instanceof Error ? error.message : "Qwen request failed."); }
    finally { setAiLoading(false); }
  }

  const trace: ToolCall[] = [
    { id: "event", name: "extract_expectation_gap", status: analysisRunning ? "running" : hasRun ? "success" : "pending", result: seededExtraction ? "Illustrative packet: positive headline and guidance signal; margin commentary is the counter-signal. No unsupported earnings figures are invented." : "User-supplied event text queued for Qwen extraction." },
    { id: "session", name: "resolve_market_clocks", status: analysisRunning ? "running" : hasRun ? "success" : "pending", result: `US cash is ${snapshot.session}; the ${snapshot.asset} venue book is evaluated separately from the latest US-session anchor.` },
    { id: "market", name: "read_bitget_market", status: loading ? "running" : snapshot.source === "live" ? "success" : "error", result: snapshot.source === "live" ? `${snapshot.symbol} bid ${money(snapshot.bid)}, ask ${money(snapshot.ask)} from public Bitget v3 market data.` : "Live request failed. The fallback book is labelled illustrative throughout the memo." },
    { id: "book", name: "test_weekend_tradability", status: analysisRunning ? "running" : hasRun ? "success" : "pending", result: `${money(result.fillRatio * 100)}% visible fill; ${money(result.spreadBps)} bps spread; ${money(result.impactBps)} bps estimated impact.` },
    { id: "reanchor", name: "model_reanchor_scenarios", status: analysisRunning ? "running" : hasRun ? "success" : "pending", result: "Three anchor-relative scenarios are shown as modeled references, not historical observations or forecasts." },
    { id: "qwen", name: "qwen_write_research_memo", status: aiLoading ? "running" : aiText ? "success" : "cancelled", result: aiText || "Qwen is called only when the user requests the evidence brief." },
  ];

  return <div className="desk"><a className="skip-link" href="#workbench">Skip to workbench</a>
    <header className="topbar"><a className="wordmark" href="/">veyra<span>/</span></a><span className="top-divider" /><span className="top-label">CLOSEPRINT DESK</span><div className="top-right"><span className="demo-tag"><FlaskConical size={14} />Public demo</span><span className="read-only"><ShieldCheck size={14} />Human decides</span></div></header>
    <main>
      <div className="page-title"><div><p className="eyebrow">AI TRADING DESK / INFORMATION EXTRACTION &amp; SIGNAL GENERATION</p><h1>What survives the Monday re-anchor?</h1><p>ClosePrint turns an after-hours event into a session-aware rToken research memo.</p></div><Button variant="outline" onClick={() => loadMarket()} disabled={loading}><RefreshCw size={14} className={loading ? "spin" : ""} />{loading ? "Refreshing" : "Refresh evidence"}</Button></div>
      <div className="flow-strip" aria-label="ClosePrint workflow"><span><b>01</b> Event packet</span><ChevronRight /><span><b>02</b> Expectation gap</span><ChevronRight /><span><b>03</b> Two market clocks</span><ChevronRight /><span><b>04</b> Weekend tradability</span><ChevronRight /><span><b>05</b> Human decision</span></div>
      <div className="workbench" id="workbench">
        <Card className="input-panel"><div className="section-heading"><span><Terminal size={16} />Research request</span><span className="mono muted">01</span></div><div className="input-body">
          <label className="field-label" htmlFor="research-question">Trader question</label><Textarea id="research-question" value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} />
          <div className="subheading input-separator"><h2>Event evidence</h2><span className="small-label">USER / SEEDED</span></div><Textarea aria-label="Event evidence" value={eventPacket} onChange={(event) => setEventPacket(event.target.value)} rows={6} /><p className="hint">The seeded packet is illustrative. Replace it with sourced event text before presenting a live claim.</p>
          <div className="subheading input-separator"><h2>rToken</h2><span className="small-label">BITGET SPOT</span></div><div className="asset-grid">{assets.map((item) => <Button key={item.symbol} variant={symbol === item.symbol ? "default" : "outline"} onClick={() => setSymbol(item.symbol)}>{item.label}</Button>)}</div>
          <div className="side-size-row"><div><span className="field-label">Research side</span><div className="side-grid"><Button variant={side === "buy" ? "default" : "outline"} onClick={() => setSide("buy")}>Buy</Button><Button variant={side === "sell" ? "default" : "outline"} onClick={() => setSide("sell")}>Sell</Button></div></div><div className="size-input"><FloatingLabelInput id="order-size" label="Size (USDT)" type="number" min={1} max={1000000} step="any" value={notional} onChange={(event) => setNotional(event.target.value)} /></div></div>
          {inputError && <p className="error" role="alert">Use a size from 1 to 1,000,000 USDT.</p>}
          <Button className="run-button" onClick={runClosePrint} disabled={inputError || loading || analysisRunning}>{analysisRunning ? "Building memo…" : "Run ClosePrint"}<ArrowRight size={16} /></Button><p className="local-note"><Braces size={13} />Research only · no order route</p>
        </div></Card>

        <div className="result-panel"><Tabs value={tab} onValueChange={setTab}><div className="result-nav"><TabsList><TabsTrigger value="memo">Research memo</TabsTrigger><TabsTrigger value="book">Book math</TabsTrigger><TabsTrigger value="evidence">Evidence</TabsTrigger></TabsList><span className={`source-pill ${snapshot.source}`}>{loading ? "FETCHING" : snapshot.source === "live" ? "LIVE BITGET" : "ILLUSTRATIVE MARKET"}</span></div>
          {marketError && <p className="stale-note" role="status">{marketError}</p>}
          <TabsContent value="memo"><Card className="memo-card"><div className="memo-head"><div><p className="eyebrow">CLOSEPRINT / {snapshot.asset}</p><div className="posture">{researchPosture}</div></div><div className={`session-badge ${snapshot.session}`}><span />{snapshot.session === "open" ? "US cash open" : "US cash closed"}</div></div>
            <p className="memo-thesis">{seededExtraction ? `The supplied event packet reads positively, but ${signed(result.anchorBasisPct, "%")} is already embedded versus the venue anchor. ${result.rationale}` : `The event text has changed. Run Qwen to extract the expectation gap; Veyra is currently showing only deterministic market and session evidence. ${result.rationale}`}</p>
            <div className="memo-grid">
              <section className="memo-section"><div className="memo-section-title"><span>01</span><h2>Event extract</h2><small>{seededExtraction ? "ILLUSTRATIVE" : "AWAITING QWEN"}</small></div><dl className="memo-list"><div><dt>Headline read</dt><dd>{seededExtraction ? "Revenue and guidance described above expectations." : "No deterministic extraction from edited text."}</dd></div><div><dt>Expectation gap</dt><dd>{seededExtraction ? "Positive, with high prior expectations limiting a headline-only conclusion." : "Requires sourced consensus plus Qwen extraction."}</dd></div><div><dt>Counter-signal</dt><dd>{seededExtraction ? "Margin commentary remains the main invalidation input." : "Not extracted yet."}</dd></div></dl></section>
              <section className="memo-section"><div className="memo-section-title"><span>02</span><h2>Two market clocks</h2><small>SESSION MODEL</small></div><div className="clock-pair"><div><span>US cash reference</span><strong>{snapshot.session === "closed" ? "CLOSED / ANCHORED" : "OPEN"}</strong><small>{money(snapshot.anchor)} latest venue anchor</small></div><div><span>{snapshot.asset} venue book</span><strong>{snapshot.source === "live" ? "LIVE" : "ILLUSTRATIVE"}</strong><small>{money(result.mid)} current mid</small></div></div></section>
              <section className="memo-section memo-section-wide"><div className="memo-section-title"><span>03</span><h2>Weekend tradability</h2><small>DETERMINISTIC</small></div><div className="metric-grid"><div><span>Book vs anchor</span><strong>{signed(result.anchorBasisPct, "%")}</strong><small>already reflected</small></div><div><span>Quoted spread</span><strong>{money(result.spreadBps)} bps</strong><small>bid to ask</small></div><div><span>Size impact</span><strong>{money(result.impactBps)} bps</strong><small>{money(result.fillRatio * 100)}% visible fill</small></div></div></section>
              <section className="memo-section memo-section-wide"><div className="memo-section-title"><span>04</span><h2>Re-anchor scenarios</h2><small>MODELED · NOT HISTORY</small></div><div className="scenario-row">{result.scenarios.map((scenario) => <div key={scenario.move}><span>{signed(scenario.move, "%")} anchor move</span><strong>{money(scenario.price)}</strong><small>{signed(scenario.versusNow)} vs estimated fill</small></div>)}</div><p className="boundary-note">Historical Bitget weekend-to-Monday analogues are not connected in this preview. These are explicit scenario references, not observed probabilities.</p></section>
              <section className="memo-section memo-section-wide invalidation"><div className="memo-section-title"><span>05</span><h2>What changes the conclusion</h2><small>INVALIDATION</small></div><p>{seededExtraction ? "A sourced transcript showing stronger margin durability, a tighter live book at the requested size, or a cash-market open that confirms the weekend move." : "A sourced event packet, consensus baseline, and successful Qwen extraction are required before the event layer can influence this memo."}</p></section>
            </div><div className="human-gate"><ShieldCheck size={16} /><div><strong>Human decision required</strong><span>Veyra presents evidence and a research posture. It cannot place an order.</span></div></div>
          </Card></TabsContent>
          <TabsContent value="book"><Card className="book-card"><div className="book-summary"><div><span>Requested</span><strong>{money(parsedNotional || 8000)} USDT</strong></div><div><span>Estimated average</span><strong>{money(result.averageFill)}</strong></div><div><span>Book cost vs mid</span><strong>{money(result.estimatedBookCost)} USDT</strong></div></div><Table><TableHeader><TableRow><TableHead>Level</TableHead><TableHead className="numeric">Price</TableHead><TableHead className="numeric">Quantity used</TableHead><TableHead className="numeric">Notional</TableHead></TableRow></TableHeader><TableBody>{result.fills.map((fill, index) => <TableRow key={`${fill.price}-${index}`}><TableCell className="muted">{String(index + 1).padStart(2, "0")}</TableCell><TableCell className="numeric">{money(fill.price)}</TableCell><TableCell className="numeric">{money(fill.quantity, 4)}</TableCell><TableCell className="numeric">{money(fill.notional)}</TableCell></TableRow>)}</TableBody></Table></Card></TabsContent>
          <TabsContent value="evidence"><Card className="evidence-card"><p className="eyebrow">SOURCES / BOUNDARIES</p><h2>Every claim carries a provenance label.</h2><dl><dt>Event layer</dt><dd>{seededExtraction ? "Illustrative seeded packet. It demonstrates the schema and must be replaced with sourced earnings/news material for a live claim." : "User-supplied text. Qwen has not extracted it unless a successful response appears in the right rail."}</dd><dt>Observed market data</dt><dd>{snapshot.source === "live" ? `Public Bitget v3 ticker and 50-level order book for ${snapshot.symbol}, timestamped ${time(snapshot.timestamp)}.` : "An illustrative fallback book. It is never presented as a live observation."}</dd><dt>Derived session anchor</dt><dd>The close of the latest completed 3–4 PM New York hourly rToken candle: {money(snapshot.anchor)} at {time(snapshot.anchorTimestamp)}. It is a venue anchor, not the official underlying close.</dd><dt>Scenario layer</dt><dd>The re-anchor panel applies −3%, 0%, and +3% to the venue anchor. It is a sensitivity test, not historical evidence or a price forecast.</dd><dt>Excluded</dt><dd>Fees, taxes, hidden liquidity, price improvement, issuer redemption, account balances, collateral treatment, and execution.</dd></dl></Card></TabsContent>
        </Tabs></div>

        <aside className="trace-column"><Card className="trace-card"><div className="section-heading"><span><ScanSearch size={16} />Research run</span><span className="small-label">TRACE</span></div><div className="trace-body"><p className="hint">The full path from event question to actionable insight.</p><AgentSteps steps={trace} /><div className="trace-status"><Check size={14} />{analysisRunning ? "Building research object" : "Evidence assembled"}</div></div></Card>
          <Card className="agent-card"><div className="section-heading"><span><Sparkles size={16} />Qwen analyst</span><span className="small-label">QWEN 3.8 MAX</span></div><div className="agent-body"><p className="hint">Extract the event, reconcile it with deterministic market evidence, and write the final brief.</p><Button className="research-button" onClick={askQwen} disabled={aiLoading || !question.trim() || !eventPacket.trim()}>{aiLoading ? "Writing brief…" : "Generate Qwen brief"}<ArrowRight size={14} /></Button>{aiText && <p className="ai-output">{aiText}</p>}{aiError && <p className="ai-error"><Unplug size={13} />{aiError}</p>}<p className="hint">Model output appears only after a successful server response.</p></div></Card>
          <Card className="market-card"><div><Clock3 size={15} /><span>Snapshot</span></div><strong>{time(snapshot.timestamp)}</strong><div><BarChart3 size={15} /><span>24h turnover</span></div><strong>{compact(snapshot.platformTurnover24h)} USDT</strong><div><BookOpen size={15} /><span>Market source</span></div><strong>{snapshot.source === "live" ? "Bitget v3" : "Illustrative"}</strong><div><FileSearch size={15} /><span>Event source</span></div><strong>{seededExtraction ? "Illustrative" : "User supplied"}</strong></Card>
        </aside>
      </div><footer><span>VEYRA / CLOSEPRINT DESK</span><span>Observed · derived · modeled · illustrative</span><span>No login. No execution.</span></footer>
    </main>
  </div>;
}
