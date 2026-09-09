import { describe, expect, it } from 'vitest';
import { simulateToolCall, localSynthesize } from './synthesize';

describe('simulateToolCall', () => {
  it('performs real arithmetic for CALCULATOR', () => {
    const result = simulateToolCall('CALCULATOR', 'Calculate 25 x 48');
    expect(result.ok).toBe(true);
    expect(result.result).toBe(1200);
  });

  it('handles division and subtraction', () => {
    expect(simulateToolCall('CALCULATOR', '90 / 3').result).toBe(30);
    expect(simulateToolCall('CALCULATOR', '90 - 3').result).toBe(87);
  });

  it('fails gracefully when no expression is found', () => {
    const result = simulateToolCall('CALCULATOR', 'Calculate something');
    expect(result.ok).toBe(false);
  });

  it('is deterministic for the same WEB_SEARCH input', () => {
    const a = simulateToolCall('WEB_SEARCH', 'What is the weather in Karachi tomorrow?');
    const b = simulateToolCall('WEB_SEARCH', 'What is the weather in Karachi tomorrow?');
    expect(a).toEqual(b);
    expect(a.demo).toBe(true);
  });

  it('returns null when no tool is selected', () => {
    expect(simulateToolCall(null, 'hello')).toBeNull();
  });
});

describe('localSynthesize', () => {
  it('renders the arithmetic result directly', () => {
    const toolResult = simulateToolCall('CALCULATOR', 'Calculate 25 x 48');
    expect(localSynthesize('Calculate 25 x 48', toolResult)).toBe('25 × 48 = 1200');
  });

  it('falls back to an acknowledgement when no tool ran', () => {
    const draft = localSynthesize('Say hello', null);
    expect(draft).toContain('Say hello');
  });
});
