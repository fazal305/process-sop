# Information Processing SOP

An interactive, illustrative visualization of a disciplined five-stage information-processing
pipeline — from raw input reception through context analysis, tool invocation, content
synthesis, and quality/compliance verification, to a final, gated delivery.

## Live Demo

**[process-sop.vercel.app](https://process-sop.vercel.app)**

## Problem statement

Handling a request as one undifferentiated pass from question to answer makes failures hard to
locate and harder to prevent. This project demonstrates the alternative: splitting the work into
named stages, each with defined inputs, outputs, and rules, so that every decision — including a
skipped step or a failed check — traces back to something explainable rather than an opaque
result.

This is an **educational, conceptual visualization**. It does not expose any specific AI
system's actual hidden reasoning, system prompt, or internal architecture — see
[Important distinction](#important-distinction) below.

## The workflow

```
01 INPUT RECEPTION → 02 CONTEXT & RULE ANALYSIS → 03 TOOL INVOCATION
        → 04 CONTENT SYNTHESIS → 05 QUALITY & COMPLIANCE → FINAL DELIVERY
```

- **Input Reception** — raw text is captured and represented as structured processing units.
- **Context & Rule Analysis** — applicable constraints (time, location, safety, intent) are identified.
- **Tool Invocation** — a deterministic, keyword-based decision layer picks at most one tool, or none.
- **Content Synthesis** — input, context, and any retrieved information converge into a draft.
- **Quality & Compliance** — six explicit pass/fail checks gate delivery; a single failure blocks it.

Every stage is explorable on the **Workflow** page (drive the state machine manually, including
forced failures and retries) and demonstrated end-to-end on the **Simulation** page (three
narrated example runs, or your own input). Full reference documentation for each stage lives on
the **Documentation** page.

## Architecture

- **React + Vite**, plain JS/JSX, no TypeScript.
- **Vanilla CSS** with a centralized design-token system (`src/styles/tokens.css`) — no CSS
  framework, so the visual language stays deliberate rather than utility-class-generic.
- **State**: an explicit finite state machine (`src/lib/workflowMachine.js`) driven by
  `useReducer`. Illegal transitions are rejected rather than corrupting state — see
  `workflowMachine.test.js`.
- **No backend.** This is a static SPA. The one external call it can make (OpenRouter, see below)
  goes directly from the visitor's browser to `openrouter.ai` using a key the visitor supplies —
  there is no server in this project to hold a secret.

```
src/
  components/
    layout/       AppShell, responsive nav (hamburger below 640px)
    workflow/      PipelineDiagram, StageDetailPanel, WorkflowControls
    simulation/    RunLog, VerificationChecklist, ResultCard, OpenRouterSettings
    docs/          StageDoc (full stage reference, reused from the same data as the inspector panel)
    ui/            PageShell
  context/         WorkflowContext (shared reducer + derived stage statuses)
  hooks/           useLocalStorage
  lib/             workflowMachine, toolDecisionEngine, synthesize, verify, openrouter, constants
  pages/           Overview, Workflow, Simulation, Documentation, About, NotFound
```

## Technology stack

React 19, React Router 7, Vite, Vitest + React Testing Library + jest-axe, plain CSS Modules with
custom-property tokens. No UI framework, no animation library, no state-management library beyond
`useReducer`/Context — deliberately, to keep the dependency surface justified by what the app
actually needs.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev      # start the Vite dev server
npm run build     # production build
npm run preview   # preview the production build locally
npm run test      # run the Vitest suite once
npm run lint      # oxlint
```

See [`docs/deployment.md`](docs/deployment.md) for deploying `dist/` to Vercel or any static host.

## Usage

- **Workflow** — type any request, or leave the field blank and just click through; the "Force
  failure here" control demonstrates the error/retry path.
- **Simulation** — pick one of three presets (a weather-shaped request, an arithmetic request, or
  a request needing no tool) or type your own, then **Run simulation**. The calculator does real
  arithmetic; the weather lookup is a deterministic, clearly-labeled `SIMULATION` (no weather API
  is connected). Optionally paste an OpenRouter API key in the Settings panel to have the
  Content Synthesis stage call a real model instead — that path is labeled `LIVE`.

## Design decisions

- **No fake metrics.** There is no numerical confidence score anywhere — verification is a named
  pass/fail checklist, because nothing in this pipeline produces a number worth showing as one.
- **Tool selection is a deterministic decision layer**, not a model call or agent loop —
  `requiresWebSearch`, `requiresCalculation`, etc. are plain regex/keyword functions, chosen for
  explainability over sophistication.
- **BYOK over server-side keys.** A public repo with a server-held API key means every visitor's
  usage is billed to the repo owner with no natural rate limit. Putting the key entirely in the
  visitor's own browser removes that risk and keeps the app a static deploy.
- **Skipping a stage is a valid, visible outcome**, not an error — the pipeline visualization has
  an explicit `SKIPPED` status distinct from `FAILED`.

## Accessibility

- Skip-to-content link, semantic landmarks (`banner`/`nav`/`main`/`contentinfo`).
- Visible `:focus-visible` ring on every interactive element; no outline removed without a
  replacement.
- The stage-detail dialog traps focus while open and restores it to the trigger on close.
- Status is never color-only — every pipeline stage shows a text status label alongside its icon.
- `prefers-reduced-motion` is honored: transition durations collapse to 0ms and the active-stage
  pulse animation is skipped entirely.
- Automated checks: `jest-axe` runs against the Overview, Workflow, Simulation, and Documentation
  pages in CI-equivalent test runs, currently with zero detected violations.

## Testing

```bash
npm run test
```

34 tests across 7 files: the state machine's legal/illegal transitions and derived stage statuses,
the tool decision engine, local synthesis (including real arithmetic), the verification checklist,
routing (including the 404 fallback), a full UI-driven integration run of the Workflow page, and
automated accessibility checks.

## Security

- No secrets in this repository, and none required — see `.env.example`.
- The optional OpenRouter key lives only in the visitor's browser `localStorage` and is sent
  directly to `openrouter.ai`; this project has no backend that ever sees it.
- No `dangerouslySetInnerHTML`, `eval`, or dynamic code execution anywhere in the codebase.
- `npm audit` reports zero known vulnerabilities as of the last dependency install.

## API / integration notes

The only external integration is OpenRouter's chat-completions endpoint, called directly from the
browser with a visitor-supplied key, used solely to generate the Stage 04 draft response when a
key is present. No other public API is integrated — weather, currency, and similar lookups are
deterministic local simulations, deliberately, so the app has no server-side secrets, no rate
limits to manage, and no third-party outage that can break the demo. See
[`docs/api-decisions.md`](docs/api-decisions.md) for the full reasoning behind every API that was
considered and rejected.

## Limitations

- The "processing units" shown in Stage 01 are a conceptual stand-in for tokenization, not a real
  tokenizer.
- The context categories in Stage 02 are illustrative, not an exposure of any real system prompt.
- Weather and similar tool retrieval are fixed, deterministic demo payloads — there is no live
  weather data.
- The OpenRouter integration depends on the visitor providing their own working key and CORS
  access from their browser to `openrouter.ai`; without one, the app falls back to the local
  simulation automatically.

## Roadmap

- Optional command palette if the navigation surface grows beyond what a flat nav comfortably covers.
- Additional simulation presets (file-processing and external-API tool paths).
- Persisted run history (per-visitor, still local-only) for comparing past simulation runs.

## Important distinction

This project is an educational visualization of a conceptual, illustrative workflow. It does not
claim to expose any specific AI model's actual hidden reasoning, proprietary system prompt, or
private chain-of-thought, and its tokenization/context/verification concepts are not a literal
description of how any particular commercial system works internally.
