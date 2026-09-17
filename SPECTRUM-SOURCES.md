# Spectrum UI source attribution

Source: https://github.com/arihantcodes/spectrum-ui — Apache-2.0.
Retrieved September 17, 2026 from official public registry:
- https://ui.spectrumhq.in/r/animated-switch.json
- https://ui.spectrumhq.in/r/agent-plan.json
- https://ui.spectrumhq.in/r/agent-steps.json
- https://ui.spectrumhq.in/r/status-badge.json

Current rendered Spectrum components: Agent Steps and Floating Label Input. Agent Plan, Animated Switch and StatusDemo remain available but are not rendered in the workflow-first redesign.

Floating Label Input source: https://raw.githubusercontent.com/arihantcodes/spectrum-ui/main/public/r/floating-label-input.json

Default dark tokens copied from https://raw.githubusercontent.com/arihantcodes/spectrum-ui/main/app/globals.css (background 0 0% 3.9%, foreground/primary 0 0% 98%, borders/secondary 0 0% 14.9%). Source accessibility and neutral colors retained. Application layout and readable type sizing are composed at the page level.

Spectrum's Button documentation explicitly uses local shadcn/ui primitives. Before reuse, inspected Spectrum's public components/ui/button.tsx, card.tsx, slider.tsx, tabs.tsx, table.tsx and textarea.tsx. Reused the equivalent already-installed shadcn primitives in this project, including Input and Label required by Floating Label Input. No replacement common components were hand-built. Only the product-specific layout and scenario math are custom.
