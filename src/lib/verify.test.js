import { describe, expect, it } from 'vitest';
import { runVerification } from './verify';

describe('runVerification', () => {
  it('passes a well-formed draft with satisfied tool requirement', () => {
    const result = runVerification({
      input: 'Calculate 25 x 48',
      toolsRequired: true,
      toolResult: { ok: true, summary: '25 × 48 = 1200' },
      draft: '25 × 48 = 1200',
    });
    expect(result.passed).toBe(true);
  });

  it('fails when a required tool produced no usable result', () => {
    const result = runVerification({
      input: 'Calculate something',
      toolsRequired: true,
      toolResult: { ok: false, summary: 'No parseable arithmetic expression found.' },
      draft: 'Unable to complete this request.',
    });
    const toolCheck = result.checks.find((c) => c.id === 'tool');
    expect(toolCheck.pass).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('fails on an empty draft', () => {
    const result = runVerification({ input: 'hello', toolsRequired: false, toolResult: null, draft: '' });
    expect(result.passed).toBe(false);
  });
});
