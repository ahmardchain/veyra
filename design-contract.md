# Veyra — design contract

## Product

Veyra is a public, no-login, read-only rToken research desk. ClosePrint converts an after-hours event and requested trade size into a provenance-labelled research brief. The interface must never resemble a broker order ticket or imply autonomous execution.

## Design read

- Artifact: technical research workbench with concise product context
- Audience: self-directed Bitget rToken traders and hackathon judges
- Mode: redesign that preserves the established dark Spectrum language
- Visual variance: 3/10
- Motion intensity: 6/10 — animated workflow edges and state transitions, with pause and reduced-motion support
- Information density: 8/10 inside the desk, 5/10 outside it
- Asset dependence: 1/10
- Brand fidelity: 9/10

## System

- Palette: Spectrum dark neutrals; blue only for workflow focus; green, red and amber only for market/state meaning
- Typography: Geist Sans for interface and narrative; Geist Mono for provenance, states and measurements
- Spacing: 8px base with 10–24px component spacing and 48–92px section rhythm
- Radius: 7–12px controls and surfaces; pills only for compact statuses
- Elevation: borders and tonal surfaces, no decorative shadows or gradients
- Motion: 150–420ms state feedback; reduced-motion support

## UX hierarchy

1. Inspect the interactive research workflow and Run brief action together in the first viewport.
2. Review or edit the research request.
3. Run ClosePrint.
4. Read the actionable insight.
5. Inspect event, session, book and sensitivity evidence.
6. Verify provenance and limitations.

Draft input must not silently rewrite a completed brief. The UI shows when a draft has changed and requires an explicit rerun.

## Data-language contract

- `live`: returned by the public Bitget market endpoint
- `illustrative`: fixed demonstration fixture
- `user-supplied`: text entered by the visitor
- `derived`: deterministic calculation from a stated input
- `modeled`: explicit sensitivity case, not an observation or forecast

No external runtime LLM is active in the current public build. Do not show a Qwen control, loading state or provider error. Event-language extraction is deterministic and must be described as such.

## Components

Use Spectrum UI Agent Steps and Floating Label Input plus the existing shadcn-compatible Button, Card, Tabs, Table and Textarea primitives. Do not recreate common controls.

React Flow supplies the requested draggable graph, handles, curved edges, zoom and keyboard selection. Custom nodes represent actual deterministic product stages, not fictional AI calls. The graph is an inspectable workflow, not a rewiring/execution editor. No hackathon positioning appears in the public interface. Veyra's monochrome branching V favicon matches the header mark.
