// Shared vocabulary for the workflow data model.
// Kept minimal in the foundation phase; the state machine and stage
// documentation content build on these primitives in later phases.

export const STAGE_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
});

export const WORKFLOW_STATE = Object.freeze({
  IDLE: 'IDLE',
  INPUT_RECEIVED: 'INPUT_RECEIVED',
  CONTEXT_ANALYZED: 'CONTEXT_ANALYZED',
  TOOLS_EVALUATED: 'TOOLS_EVALUATED',
  TOOLS_RUNNING: 'TOOLS_RUNNING',
  SYNTHESIZING: 'SYNTHESIZING',
  VERIFYING: 'VERIFYING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  ERROR: 'ERROR',
});

// The five pipeline stages plus the terminal delivery step. `id` values
// match STAGE_STATUS keys used by the workflow reducer. Each stage carries
// the detail content shown in both the Workflow inspector panel and the
// Documentation page, so it is authored once here.
export const STAGES = [
  {
    id: 'INPUT',
    number: '01',
    title: 'Input Reception',
    summary: 'Raw user text is received and represented as structured processing units.',
    purpose: 'Receive the raw request and establish it as the unit of work for every later stage.',
    inputs: ['Raw text submitted by the user'],
    processing: [
      'Capture the input verbatim, with a timestamp',
      'Split the text into an illustrative list of processing units (a conceptual, non-technical stand-in for tokenization)',
      'Record basic metadata: character count, unit count, detected language cue',
    ],
    outputs: ['A structured request object: raw text + metadata + processing units'],
    rules: ['Empty input is rejected before the machine leaves IDLE'],
    example: '"What is the weather in Karachi tomorrow?" → 8 processing units, en, 41 characters.',
    edgeCases: ['Empty or whitespace-only input', 'Extremely long input', 'Non-Latin script input'],
  },
  {
    id: 'CONTEXT',
    number: '02',
    title: 'Context & Rule Analysis',
    summary: 'Applicable rules, constraints, and situational context are identified.',
    purpose: 'Determine which constraints govern this specific request before any tool or synthesis work begins.',
    inputs: ['The structured request from Stage 01'],
    processing: [
      'Check for language requirements',
      'Check for time-sensitivity (does the request reference "today", "tomorrow", a deadline?)',
      'Check for location-dependence',
      'Check for safety-relevant topics',
      'Summarize user intent in one line',
    ],
    outputs: ['A context report: each rule category marked detected / required / not required / satisfied'],
    rules: [
      'This stage never fabricates or exposes a hidden system prompt — only conceptual categories are shown',
    ],
    example: 'Time: required. Location: required. Safety: not required. Intent: "get a weather forecast."',
    edgeCases: ['Ambiguous intent', 'Conflicting constraints', 'No applicable rules'],
  },
  {
    id: 'TOOLS',
    number: '03',
    title: 'Tool Invocation',
    summary: 'A deterministic decision layer determines whether external tools are required.',
    purpose: 'Decide, explainably, whether the request needs information the model does not already have.',
    inputs: ['The context report from Stage 02'],
    processing: [
      'Run the local decision functions: requiresWebSearch, requiresCalculation, requiresFileProcessing, requiresExternalApi',
      'Select at most one tool for this run',
      'Skip this stage entirely when no signal matches',
    ],
    outputs: ['Selected tool (or none) and a retrieved-information payload'],
    rules: ['Not every request requires a tool — skipping is a valid, expected outcome, not a failure'],
    example: '"Calculate 25 × 48" → CALCULATOR selected, web search and file tools not triggered.',
    edgeCases: ['Tool selected but simulated call fails', 'Multiple signals match — highest-priority one wins'],
  },
  {
    id: 'SYNTHESIS',
    number: '04',
    title: 'Content Synthesis',
    summary: 'Input, context, and any retrieved information converge into a draft response.',
    purpose: 'Combine everything gathered so far into a single structured draft response.',
    inputs: ['Original input', 'Context report', 'Tool output (if any)'],
    processing: [
      'Merge the sources into one draft',
      'Apply the requested format if one was implied by the input',
      'Where a visitor has supplied an OpenRouter key, optionally call a real model for the draft text; otherwise use the local deterministic draft',
    ],
    outputs: ['A draft response, labeled SIMULATION or LIVE (OpenRouter) depending on the path taken'],
    rules: ['No numerical confidence score is shown — there is nothing defensible to compute it from'],
    example: 'Draft: "Karachi — Tuesday: partly cloudy, high 34°C." (labeled SIMULATION)',
    edgeCases: ['No retrieved information available', 'OpenRouter call fails or times out'],
  },
  {
    id: 'VERIFICATION',
    number: '05',
    title: 'Quality & Compliance',
    summary: 'The draft is checked against structure, accuracy, constraints, safety, and tone.',
    purpose: 'Confirm the draft is fit to deliver before it is shown as final.',
    inputs: ['The draft response from Stage 04'],
    processing: [
      'Structure check: formatting matches what was requested',
      'Constraint check: does the draft satisfy the context report from Stage 02',
      'Safety check: no disallowed disclosures',
      'Tone check: appropriately concise, not padded',
    ],
    outputs: ['A pass/fail checklist and, on pass, the final response'],
    rules: ['A single failed check blocks delivery and routes to ERROR with a named cause'],
    example: '✓ Structure  ✓ Constraints  ✓ Safety  ✓ Tone → READY FOR DELIVERY',
    edgeCases: ['One check fails while others pass', 'Retry after a failed check'],
  },
];
