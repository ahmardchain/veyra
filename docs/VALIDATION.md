# Veyra — validation plan

Veyra is an MVP. The metrics below distinguish completed technical checks from future user-validation targets.

## Completed product checks

| Check | Status | Evidence |
| --- | --- | --- |
| Input size validation | Completed | Rejects UI values below 1 USDT and values above 1,000,000 USDT |
| Visible-book fill math | Completed | Walks price levels until requested notional is filled or depth ends |
| Spread and impact math | Completed | Deterministic TypeScript calculations |
| Session separation | Completed | Scheduled NYSE 2026–2028 holidays and early closes; excludes unscheduled halts |
| Live-data fallback | Completed | Failed Bitget requests switch to an explicit illustrative source |
| Provenance labels | Completed | Live, illustrative, user-supplied, derived and modeled labels in UI |
| Human execution gate | Completed | No wallet, account or order endpoint exists |
| Production build | Completed | `VERCEL=1 npx next build` before release |

## First-user validation

Recruit ten self-directed traders who already use tokenized equities or actively follow after-hours US-stock events. Ask each person to complete the seeded rNVDA task without guidance.

| Metric | Target | Measurement |
| --- | ---: | --- |
| Task completion | ≥80% | Reaches and explains the final posture without assistance |
| Provenance comprehension | ≥80% | Correctly identifies illustrative versus observed inputs |
| Time to brief | <60 seconds median | Start of scenario to interpretable conclusion |
| Session-model comprehension | ≥80% | Explains why the rToken print can differ from Monday cash open |
| Misleading fallback claims | 0 | No tester believes illustrative fallback data is live |
| Return intent | ≥50% | Says they would use the workflow for another event |

These figures are targets, not observed results.

## Research-quality follow-up

1. Acquire a reliable historical rToken weekend tape.
2. Join weekend last prints to next US cash opens by ticker and event.
3. Label vendor observations separately from reconstructed values.
4. Add five analogues only when data lineage can be shown.
5. Compare the deterministic event read with a verified LLM extraction layer.

## Explicit exclusions

- No profitability, win-rate or alpha claim.
- No claim that a modeled case is historically likely.
- No claim that the venue anchor is the official underlying close.
- No claim that hidden liquidity, fees or price improvement are modeled.
- No autonomous order placement.

## 17 September 2026 engineering checks

Five automated tests passed: calendar sessions, incomplete-anchor exclusion, book ordering/anchor independence, quoted evidence validation, and missing-config/401/empty-provider handling. Provider responses in these tests are mocked. No live AI response, customer study or return benefit is established. See tests/research.test.ts.
