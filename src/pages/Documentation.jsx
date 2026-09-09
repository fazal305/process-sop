import StageDoc from '../components/docs/StageDoc';
import { STAGES } from '../lib/constants';
import styles from './Documentation.module.css';

const NAV_SECTIONS = [
  { id: 'what-is-it', label: 'What is the SOP?' },
  { id: 'why-it-matters', label: 'Why it matters' },
  { id: 'stages', label: 'The five stages' },
  { id: 'tool-decision-model', label: 'Tool decision model' },
  { id: 'verification', label: 'Verification' },
  { id: 'distinction', label: 'Important distinction' },
];

const REASONS = [
  'Consistency — the same request shape is handled the same way every time, instead of depending on ad hoc judgment.',
  'Reliability — a fixed sequence of checkpoints means a mistake at one stage is caught before it reaches the next.',
  'Explainability — every decision (skip a tool, fail a check) traces back to a named rule, not an opaque score.',
  'Quality — nothing is delivered until it has passed an explicit verification stage, not just "looked done".',
];

const TOOL_FUNCTIONS = [
  { name: 'requiresWebSearch(text)', detail: 'Matches time-sensitive or lookup-shaped phrasing — "weather", "latest", "who is".' },
  { name: 'requiresCalculation(text)', detail: 'Matches an arithmetic expression or words like "calculate" / "compute".' },
  { name: 'requiresFileProcessing(text)', detail: 'Matches references to an attached or uploaded file.' },
  { name: 'requiresExternalApi(text)', detail: 'Matches requests for live rates — currency, stock, crypto.' },
  { name: 'requiresLocation(text)', detail: 'Flags location-dependence, used by the context stage rather than to pick a tool.' },
  { name: 'requiresTime(text)', detail: 'Flags time-dependence — "today", "tomorrow", "this week".' },
];

export default function Documentation() {
  return (
    <div className={styles.layout}>
      <nav className={styles.nav} aria-label="Documentation sections">
        <div className={styles.navLabel}>ON THIS PAGE</div>
        <ul className={styles.navList}>
          {NAV_SECTIONS.map((section) => (
            <li key={section.id}>
              <a className={styles.navLink} href={`#${section.id}`}>
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>REFERENCE</span>
          <h1 className={styles.title}>Documentation</h1>
          <p className={styles.subtitle}>
            What the pipeline does at each stage, why the tool decision layer works the way it
            does, and why nothing is delivered without passing verification first.
          </p>
        </div>

        <section id="what-is-it" className={styles.section}>
          <h2 className={styles.sectionTitle}>What is the SOP?</h2>
          <p className={styles.body}>
            It's a fixed, five-stage sequence a request moves through before a response is
            considered final: input reception, context and rule analysis, tool invocation,
            content synthesis, and quality &amp; compliance verification. Each stage has a defined
            purpose, defined inputs and outputs, and an explicit set of rules — nothing is
            skipped implicitly, and every skip that does happen (like bypassing tool invocation)
            is a recorded, visible decision rather than a silent shortcut.
          </p>
        </section>

        <section id="why-it-matters" className={styles.section}>
          <h2 className={styles.sectionTitle}>Why it matters</h2>
          <p className={styles.body}>
            Handling every request as one undifferentiated pass from question to answer makes
            failures hard to locate and harder to prevent. Splitting the work into named stages
            with their own checkpoints gives four concrete benefits:
          </p>
          <ul className={styles.reasonList}>
            {REASONS.map((reason) => (
              <li key={reason} className={styles.reasonItem}>
                {reason}
              </li>
            ))}
          </ul>
        </section>

        <section id="stages" className={styles.section}>
          <h2 className={styles.sectionTitle}>The five stages</h2>
          <p className={styles.body} style={{ marginBottom: 'var(--space-5)' }}>
            The same content shown in the Workflow inspector panel, laid out in full for
            reference.
          </p>
          <div>
            {STAGES.map((stage) => (
              <StageDoc key={stage.id} stage={stage} />
            ))}
          </div>
        </section>

        <section id="tool-decision-model" className={styles.section}>
          <h2 className={styles.sectionTitle}>Tool decision model</h2>
          <p className={styles.body}>
            Stage 03 does not use a model call or an agent loop to decide whether a tool is
            needed — it runs a small set of deterministic, keyword- and pattern-based functions
            against the request text. At most one tool is selected per run, chosen by fixed
            priority (calculation, then external API, then file processing, then web search).
            This keeps the decision explainable: any visitor can read the exact rule that fired.
          </p>
          <ul className={styles.reasonList}>
            {TOOL_FUNCTIONS.map((fn) => (
              <li key={fn.name} className={styles.reasonItem}>
                <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{fn.name}</code>
                {' — '}
                {fn.detail}
              </li>
            ))}
          </ul>
          <div className={styles.calloutBox}>
            Not every request needs a tool. Skipping Stage 03 is a valid, expected outcome — the
            "No tool needed" example on the Simulation page demonstrates this directly.
          </div>
        </section>

        <section id="verification" className={styles.section}>
          <h2 className={styles.sectionTitle}>Verification</h2>
          <p className={styles.body}>
            A draft response is not the final response. Before delivery, Stage 05 runs six
            explicit checks — request understood, required tool used, required information
            available, formatting satisfied, tone appropriate, and safety requirements satisfied.
            Every check is a plain pass/fail with a named reason; there is no numerical confidence
            score, because nothing in this pipeline produces a number that would be defensible to
            show as one. A single failed check blocks delivery and routes the run to an explicit
            error state rather than shipping a partial or unverified result.
          </p>
        </section>

        <section id="distinction" className={styles.section}>
          <h2 className={styles.sectionTitle}>Important distinction</h2>
          <p className={styles.body}>
            This site is an educational, illustrative visualization of a disciplined information-
            processing workflow — not a disclosure of any specific AI system's actual hidden
            reasoning, system prompt, or internal architecture. The "processing units" shown in
            Stage 01 are a conceptual stand-in for tokenization, not a real tokenizer. The context
            categories in Stage 02 are conceptual, not an exposure of a real system prompt. Where
            the Simulation page calls a real language model through a visitor-supplied OpenRouter
            key, that step is explicitly labeled <strong>LIVE</strong>; everything else is local,
            deterministic logic labeled <strong>SIMULATION</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
