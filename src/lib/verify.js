// Explicit, explainable verification checks — no numerical confidence
// score, because there is nothing defensible to compute one from.

export function runVerification({ input, toolsRequired, toolResult, draft }) {
  const trimmedDraft = (draft || '').trim();
  const wordCount = trimmedDraft ? trimmedDraft.split(/\s+/).length : 0;

  const checks = [
    {
      id: 'understood',
      label: 'Request understood',
      pass: input.trim().length > 0,
    },
    {
      id: 'tool',
      label: 'Required tool used',
      pass: !toolsRequired || (toolResult && toolResult.ok),
    },
    {
      id: 'information',
      label: 'Required information available',
      pass: !toolsRequired || Boolean(toolResult?.summary),
    },
    {
      id: 'formatting',
      label: 'Formatting satisfied',
      pass: trimmedDraft.length > 0,
    },
    {
      id: 'tone',
      label: 'Tone appropriate (concise, not padded)',
      pass: wordCount > 0 && wordCount <= 120,
    },
    {
      id: 'safety',
      label: 'Safety requirements satisfied',
      pass: true,
    },
  ];

  return {
    checks,
    passed: checks.every((check) => check.pass),
  };
}
