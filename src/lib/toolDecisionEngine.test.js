import { describe, expect, it } from 'vitest';
import { decideTool, evaluateTools, requiresCalculation, requiresWebSearch } from './toolDecisionEngine';

describe('toolDecisionEngine', () => {
  it('detects a calculation request', () => {
    expect(requiresCalculation('Calculate 25 x 48')).toBe(true);
    expect(requiresCalculation('25 * 48')).toBe(true);
  });

  it('detects a web-search-shaped request', () => {
    expect(requiresWebSearch('What is the weather in Karachi tomorrow?')).toBe(true);
  });

  it('does not flag a plain conversational request', () => {
    expect(decideTool('Say hello in a friendly way')).toBeNull();
  });

  it('prioritizes calculation over other signals when both could match', () => {
    expect(decideTool('Calculate the currency price of 25 x 48')).toBe('CALCULATOR');
  });

  it('evaluateTools returns a full signal breakdown', () => {
    const result = evaluateTools('What is the weather in Karachi tomorrow?');
    expect(result.toolsRequired).toBe(true);
    expect(result.tool).toBe('WEB_SEARCH');
    expect(result.signals.location).toBe(true);
    expect(result.signals.time).toBe(true);
  });
});
