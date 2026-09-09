import PageShell from '../components/ui/PageShell';

export default function About() {
  return (
    <PageShell
      eyebrow="ABOUT"
      title="About this project"
      subtitle="An educational visualization of a disciplined information-processing workflow — built as a portfolio engineering piece, not a product claiming to expose a specific AI system's internals."
    >
      <p style={{ maxWidth: '60ch', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
        Every stage, decision rule, and verification check shown here is illustrative. Where the
        simulation calls a real language model (via a visitor-supplied OpenRouter key), that step
        is labeled explicitly — everything else is deterministic, local logic.
      </p>
    </PageShell>
  );
}
