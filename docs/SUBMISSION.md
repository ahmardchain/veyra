# Veyra — submission draft

## Form selections

- **Main track:** AI Trading Desk
- **Sub-theme:** Information Extraction & Signal Generation
- **Project:** Veyra
- **Demo:** https://veyraa-rust.vercel.app/
- **Code:** https://github.com/ahmardchain/veyra
- **University Name:** `[ENTER FULL UNIVERSITY NAME]`
- **Apply for Demo Day:** Yes

## Project description

### 1. Thesis

rTokens can continue trading while the US cash market is closed. That creates a practical research problem: the live rToken order book, the latest US-session reference and the next cash-market open are different clocks. Existing AI stock tools summarize an earnings release or headline but usually stop before answering the Bitget-specific question: what does the current rToken book already reflect, is the book tradeable at my size, and what could change at the Monday re-anchor?

Veyra tests the thesis that a session-aware research object is more useful than another generic news summary. ClosePrint separates event language, venue state, visible-book cost, modeled re-anchor sensitivity and invalidation evidence before presenting an actionable research posture. It never places the trade.

### 2. Target user and product value

The target user is a self-directed Bitget retail or small-VIP trader who trades liquid mega-cap rTokens such as rNVDA, rTSLA and rQQQ, typically with a $1,000–$50,000 position, around after-close earnings or weekend news. Their current workflow is to read a headline, glance at the latest token price and guess whether the move will persist. Veyra compresses the decision research into one transparent workflow while showing the cost and limits of acting before the cash market reopens.

### 3. Validation data and key metrics

The current version is a public MVP; no user-performance claims are made. Completed technical checks cover deterministic order-book pricing, input validation, source fallbacks, build success and responsive interaction states. Proposed first-user validation targets are: at least 80% unaided completion of one ClosePrint task, at least 80% correct understanding of observed versus illustrative data, median time-to-brief below 60 seconds, and zero cases where fallback values are presented as live. The first ten testers will be asked to compare Veyra with their current headline-plus-chart workflow.

### 4. Progress

Built: a public no-login Next.js demo, live public Bitget rToken ticker/order-book/candle requests, illustrative fallback books, a session resolver, venue-anchor derivation, event-language extraction, spread/depth/fill/impact calculations, modeled re-anchor sensitivity, provenance labels, human decision gate, mobile layouts and an inspectable research trace.

Not built: external runtime LLM, transcript authenticity verification, historical weekend-to-Monday analogue database, account access or execution. A Qwen subsidy credential was tested but rejected by the provider; the dependency was removed from the public judge path so it cannot break the demo. The current build makes no claim that an external model generated the brief.

Frameworks and tools: Next.js, React, TypeScript, Spectrum UI components, shadcn-compatible primitives and Bitget public v3 market endpoints.

### 5. Deliverables

- Public interactive demo
- GitHub source repository
- 90-second product walkthrough `[ADD VIDEO URL]`
- Validation plan and evidence boundaries in the repository
- X product post `[ADD X POST URL]`

### 6. Take on AI trading

The hardest part of AI-assisted trading is not generating more opinions; it is preserving the boundary between evidence, inference and action. For 24/7 tokenized equities, session semantics are part of the evidence. A useful desk should identify which market is live, label what is modeled, expose the cost of immediacy and keep execution behind a human gate.

## Role of the LLM

LLMs were used during development for research synthesis, product framing and code assistance. The current public runtime does not invoke an external LLM: it uses deterministic event-language rules and book calculations so the demo remains reproducible after the supplied Qwen credential was rejected. No Qwen-generated runtime output is claimed. Future work can replace the bounded event-language stage with an LLM once a working provider credential is available, while keeping all pricing and provenance checks deterministic.

## X promotional post draft

US cash can be closed while rTokens keep trading. The weekend print is not the Monday open.

I built Veyra: a session-aware research desk that turns an after-hours event into a transparent ClosePrint brief—event gap, two market clocks, visible-book cost, re-anchor sensitivity and a human decision gate.

Demo: https://veyraa-rust.vercel.app/

#BitgetHackathon @Bitget_AI

Before submitting, quote or retweet the official S2 post required by the form and replace the placeholder links above.

## Final form checklist

- [ ] Enter full university name.
- [ ] Record and upload the demo video.
- [ ] Publish the compliant X post with `#BitgetHackathon` and `@Bitget_AI`.
- [ ] Add video and X URLs above.
- [ ] Confirm the demo and repository are publicly accessible.
- [ ] Select Apply for Demo Day.
- [ ] Submit before September 27, 2026, UTC+8.
