import { describe, expect, it } from 'vitest';
import { initialWorkflowState, workflowReducer, getStageStatuses } from './workflowMachine';
import { STAGE_STATUS, WORKFLOW_STATE as S } from './constants';

function advance(state, actions) {
  return actions.reduce((acc, action) => workflowReducer(acc, action), state);
}

describe('workflowReducer', () => {
  it('rejects an illegal transition instead of mutating state', () => {
    const next = workflowReducer(initialWorkflowState, { type: 'DELIVER' });
    expect(next).toBe(initialWorkflowState);
  });

  it('moves through the full happy path to DELIVERED', () => {
    const final = advance(initialWorkflowState, [
      { type: 'SUBMIT_INPUT', payload: 'Calculate 25 x 48' },
      { type: 'ANALYZE_CONTEXT' },
      { type: 'EVALUATE_TOOLS', payload: { tool: 'CALCULATOR', toolsRequired: true } },
      { type: 'RUN_TOOLS' },
      { type: 'TOOLS_COMPLETE' },
      { type: 'SYNTHESIZE_COMPLETE' },
      { type: 'VERIFICATION_PASS' },
      { type: 'DELIVER' },
    ]);

    expect(final.value).toBe(S.DELIVERED);

    const statuses = getStageStatuses(final);
    expect(statuses.INPUT).toBe(STAGE_STATUS.COMPLETED);
    expect(statuses.CONTEXT).toBe(STAGE_STATUS.COMPLETED);
    expect(statuses.TOOLS).toBe(STAGE_STATUS.COMPLETED);
    expect(statuses.SYNTHESIS).toBe(STAGE_STATUS.COMPLETED);
    expect(statuses.VERIFICATION).toBe(STAGE_STATUS.COMPLETED);
    expect(statuses.DELIVERY).toBe(STAGE_STATUS.COMPLETED);
  });

  it('skips the tools stage when no tool is required', () => {
    const state = advance(initialWorkflowState, [
      { type: 'SUBMIT_INPUT', payload: 'Say hello' },
      { type: 'ANALYZE_CONTEXT' },
      { type: 'EVALUATE_TOOLS', payload: { tool: null, toolsRequired: false } },
      { type: 'SKIP_TOOLS' },
    ]);

    expect(state.value).toBe(S.SYNTHESIZING);
    expect(getStageStatuses(state).TOOLS).toBe(STAGE_STATUS.SKIPPED);
  });

  it('routes a tool failure to ERROR and records the origin stage', () => {
    const state = advance(initialWorkflowState, [
      { type: 'SUBMIT_INPUT', payload: 'weather in Karachi' },
      { type: 'ANALYZE_CONTEXT' },
      { type: 'EVALUATE_TOOLS', payload: { tool: 'WEB_SEARCH', toolsRequired: true } },
      { type: 'RUN_TOOLS' },
      { type: 'TOOL_FAILURE', payload: 'Search timed out' },
    ]);

    expect(state.value).toBe(S.ERROR);
    expect(state.error).toBe('Search timed out');
    expect(getStageStatuses(state).TOOLS).toBe(STAGE_STATUS.FAILED);
  });

  it('retry returns to the stage that failed', () => {
    const failed = advance(initialWorkflowState, [
      { type: 'SUBMIT_INPUT', payload: 'weather in Karachi' },
      { type: 'ANALYZE_CONTEXT' },
      { type: 'EVALUATE_TOOLS', payload: { tool: 'WEB_SEARCH', toolsRequired: true } },
      { type: 'RUN_TOOLS' },
      { type: 'TOOL_FAILURE', payload: 'Search timed out' },
    ]);

    const retried = workflowReducer(failed, { type: 'RETRY' });
    expect(retried.value).toBe(S.TOOLS_RUNNING);
    expect(retried.error).toBeNull();
  });

  it('reset returns to a clean IDLE state from anywhere, including ERROR', () => {
    const failed = advance(initialWorkflowState, [
      { type: 'SUBMIT_INPUT', payload: 'weather in Karachi' },
      { type: 'ANALYZE_CONTEXT' },
      { type: 'EVALUATE_TOOLS', payload: { tool: 'WEB_SEARCH', toolsRequired: true } },
      { type: 'RUN_TOOLS' },
      { type: 'TOOL_FAILURE' },
    ]);

    const reset = workflowReducer(failed, { type: 'RESET' });
    expect(reset).toEqual(initialWorkflowState);
  });

  it('cannot skip stages: DELIVER is illegal before VERIFICATION_PASS', () => {
    const state = advance(initialWorkflowState, [
      { type: 'SUBMIT_INPUT', payload: 'Calculate 25 x 48' },
      { type: 'ANALYZE_CONTEXT' },
      { type: 'EVALUATE_TOOLS', payload: { tool: 'CALCULATOR', toolsRequired: true } },
      { type: 'RUN_TOOLS' },
      { type: 'TOOLS_COMPLETE' },
      { type: 'SYNTHESIZE_COMPLETE' },
    ]);

    const skipped = workflowReducer(state, { type: 'DELIVER' });
    expect(skipped.value).toBe(S.VERIFYING);
  });
});
