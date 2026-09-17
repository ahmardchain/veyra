# Veyra submission pack — 17 September 2026

## Readiness: not yet fully demonstrated

Intended track: **AI Trading Desk**. Intended sub-theme: **Information Extraction & Signal Generation**.

The product demonstrates session-aware visible-book research. Runtime AI review is implemented but no successful live model run has been verified. Do not describe the rules fallback as AI extraction or claim MCP/Skills are integrated. A functional AI review and a genuine sourced event excerpt are the most important remaining research-quality improvements. Final eligibility and awards are the organizers' decision.

The handbook currently says 27 September, while the supplied official form says **21 September, 23:59 UTC+8**. Use the earlier date (16:59 WAT on 21 September) unless organizers explicitly resolve the discrepancy.

Handbook: https://bitget-ai.gitbook.io/bitgetai_hackathons2

## Form fields

- Team name: Veyra (solo builders can use the project name)
- Team lead UID: [your numeric Bitget UID]
- Email: [your active email]
- Contact: [your actual Telegram @handle or X @handle]
- Background: Student and Developer, if accurate
- University: [full official university name; required to enter the university pool]
- Demo Day: Yes if you want the opportunity
- How heard: select your actual source
- Track: AI Trading Desk
- Sub-theme: Information Extraction & Signal Generation
- Project name: Veyra
- Summary: Veyra connects event evidence, US cash sessions and rToken book costs in a read-only research brief for Bitget traders.

## Project description — paste these five parts

### Part 1 — Thesis
Veyra addresses a specific research gap: a trader can see an rToken quote while the US cash market is closed, but the quote alone does not show the liquidity available for their size or establish an event's effect. A general earnings summary also leaves the user to reconcile event evidence, session status and execution costs manually. Our hypothesis is that combining these in one inspectable research object helps users distinguish an event claim from a venue price and a modeled scenario. The current product measures visible-book conditions; it does not predict which weekend move will survive Monday.

### Part 2 — Target user and product value
Our target is a self-directed Bitget rToken trader who follows US mega-cap earnings or weekend news, considers roughly 1,000–50,000 USDT positions, and trades around events rather than continuously. They accept equity price risk but need to understand thin-book costs before deciding. Veyra takes a question, event packet, asset, side and size and produces an event-language read, cash-session status, visible-book fill calculation, anchor sensitivity and limitations. The person makes the decision; no order is sent. The 8,000 USDT rNVDA walkthrough is illustrative, not customer evidence.

### Part 3 — Validation data and key metrics
Observed technical validation: five automated tests pass for scheduled holidays/early closes, incomplete-anchor exclusion, execution-cost consistency, quote matching and safe API failures. These are engineering checks, not user or trading performance results. There are no measured customer adoption, retention, return, Sharpe or profitability results. Book impact and fill costs are estimates from visible depth; sensitivity cases are modeled, and demo fixtures are explicitly illustrative.

Validation plan: recruit ten relevant traders and ask them to complete one event-to-brief task. Target at least 80% unassisted completion, at least 80% correct source-status identification, median completion under 60 seconds, and zero users mistaking illustrative data for live data. These are targets. Measure activation as a completed first brief, then track a second event review within seven days as retention. Initial distribution will use a public walkthrough and direct feedback invitations to tokenized-equity traders. No volume or AUM uplift is claimed.

### Part 4 — Progress
Built: a public no-login Next.js/React desk; interactive React Flow workflow; Bitget public v3 ticker, book and candle integration; deterministic order-book calculations; scheduled US cash-session calendar; explicit fallback/provenance labels; a structured run download; and a server-side OpenAI-compatible AI review adapter with response validation. The adapter can answer the research question and extract an expectation gap, counter-signal and invalidation, with quotes checked against the supplied packet. The earlier Qwen subsidy credential was rejected. A successful live runtime model response has not yet been verified, so the available baseline uses keyword rules and deterministic mathematics. No Bitget MCP, bitget-signal Skill, transcript verification or historical analogue dataset is claimed. Next steps are a working model connection, a sourced event walkthrough and user validation.

### Part 5 — Take on AI Trading
The useful role of AI here is to organize supplied evidence, address the user's question and make missing information explicit. Deterministic code should own the book calculations, and the user should own the decision. Research quality depends on source lineage and bounded claims, not the number of agents shown on screen.

## Submission material links

Replace brackets before submitting. The walkthrough must be accessible without requesting permission. Screenshots alone do not satisfy the run-record requirement.

Project: https://veyraa-rust.vercel.app/
Source / README: https://github.com/ahmardchain/veyra
Run walkthrough: [public video URL showing one complete research task]
Demo video: [same public X or YouTube video URL, under 3 minutes]
Validation: https://github.com/ahmardchain/veyra/blob/main/docs/VALIDATION.md

## Role of the LLM / AI — current honest answer

Codex/ChatGPT (OpenAI; exact development model ID not recorded) assisted with implementation and debugging. Grok (xAI; version not recorded) supplied early research suggestions that were treated as unverified input. Veyra includes an optional server-side OpenAI-compatible model adapter for question answering, expectation-gap extraction, counter-signals and invalidation, with quoted evidence matched to the supplied packet. A successful live runtime response has not yet been verified after the Qwen subsidy credential was rejected. The current fallback uses deterministic keyword rules and order-book calculations; it is not presented as an LLM. No model executes orders.

If you activate and verify a model before submission, replace the runtime-status sentence with its actual model identifier and actual demonstrated job. Do not claim Qwen is running merely because a key was entered.

## Remaining fields

- X project post URL: [actual published URL]
- S1 participation: No only if accurate; otherwise Yes and explain substantive additions
- S1 additions: leave blank if not applicable
- Post-event Kimi K3 credits: Yes if desired; not a claim of current Kimi integration
- Playbook review/listing interest: Yes if you want a discussion; no commercial commitment

## Suggested X quote-post draft

Quote the official S2 post: https://x.com/Bitget_AI/status/2100519318824055159

I'm building Veyra: a read-only desk connecting event evidence, cash-session status and visible rToken book costs. The demo separates illustrative data from live quotes and modeled scenarios. Humans decide; no orders are placed.

Demo: https://veyraa-rust.vercel.app/
#BitgetHackathon @Bitget_AI

Attach the walkthrough. Do not publish claims of successful runtime AI until verified.
