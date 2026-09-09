# API and integration decisions

This project deliberately integrates only one external API. This document records why, so the
reasoning survives independently of any single conversation or commit.

## What was considered

Weather, currency/exchange-rate, calculator, dictionary/text-analysis, and similar public APIs
were all candidates for the Simulation page's tool-invocation demos.

## Why they were rejected

For each candidate, the same questions applied: does it materially improve the product, is it
free, does it need authentication, does it have rate limits, is it appropriate for a public
GitHub repository, does it create privacy or deployment problems, is it stable, and can the app
work without it?

Every one of them failed at least one of those questions in a way that mattered:

- A live weather/currency API would need a key. A public repo with a server-held key means every
  visitor's traffic is billed to (and rate-limited against) the repo owner's account, with no
  natural cap.
- The app's purpose is to illustrate a **pipeline**, not to be a working weather app — a real API
  call adds a failure mode (the third-party service being down) for a demo whose point is the
  workflow shape, not the payload's accuracy.
- The spec this project follows explicitly requires simulated data to be clearly labeled
  `DEMO`/`SIMULATION` rather than presented as live — a fixed, deterministic payload satisfies
  that requirement with strictly less risk than a real integration.

## Why OpenRouter is the one exception

OpenRouter is integrated, but only as **bring-your-own-key**: each visitor supplies their own key
in the browser, and it is used only to call OpenRouter directly from that browser — this project
has no backend to hold a shared key in the first place, so the "who pays for it" and "who can
abuse it" problems above don't apply. See the README's Security section for the full handling
description.

## Local, deterministic alternatives used instead

- **Calculator** — real arithmetic, computed locally (`src/lib/synthesize.js`).
- **Weather lookup** — a fixed, deterministic payload derived from a hash of the input, so the
  same request always produces the same demo forecast. Labeled `SIMULATION` in the UI.
- **Tool decision** — plain regex/keyword matching (`src/lib/toolDecisionEngine.js`), not a model
  call, so the decision is explainable rather than opaque.
