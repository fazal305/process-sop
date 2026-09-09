import { useState } from 'react';
import { WORKFLOW_STATE as S } from '../../lib/constants';
import { evaluateTools } from '../../lib/toolDecisionEngine';
import styles from './WorkflowControls.module.css';

const ADVANCE_LABEL = {
  [S.INPUT_RECEIVED]: 'Analyze context →',
  [S.CONTEXT_ANALYZED]: 'Evaluate tools →',
  [S.TOOLS_EVALUATED]: 'Run tool step →',
  [S.TOOLS_RUNNING]: 'Complete tool call →',
  [S.SYNTHESIZING]: 'Run verification →',
  [S.VERIFYING]: 'Pass verification →',
  [S.READY]: 'Deliver →',
};

const FAILURE_ACTION = {
  [S.TOOLS_RUNNING]: 'TOOL_FAILURE',
  [S.SYNTHESIZING]: 'SYNTHESIS_FAILURE',
  [S.VERIFYING]: 'VERIFICATION_FAIL',
};

export default function WorkflowControls({ state, dispatch }) {
  const [draft, setDraft] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    dispatch({ type: 'SUBMIT_INPUT', payload: draft.trim() });
  }

  function handleAdvance() {
    switch (state.value) {
      case S.INPUT_RECEIVED:
        dispatch({ type: 'ANALYZE_CONTEXT' });
        return;
      case S.CONTEXT_ANALYZED: {
        const { tool, toolsRequired } = evaluateTools(state.input);
        dispatch({ type: 'EVALUATE_TOOLS', payload: { tool, toolsRequired } });
        return;
      }
      case S.TOOLS_EVALUATED:
        dispatch({ type: state.toolsRequired ? 'RUN_TOOLS' : 'SKIP_TOOLS' });
        return;
      case S.TOOLS_RUNNING:
        dispatch({ type: 'TOOLS_COMPLETE' });
        return;
      case S.SYNTHESIZING:
        dispatch({ type: 'SYNTHESIZE_COMPLETE' });
        return;
      case S.VERIFYING:
        dispatch({ type: 'VERIFICATION_PASS' });
        return;
      case S.READY:
        dispatch({ type: 'DELIVER' });
        return;
      default:
        return;
    }
  }

  const advanceLabel = ADVANCE_LABEL[state.value];
  const failureAction = FAILURE_ACTION[state.value];
  const isIdle = state.value === S.IDLE;
  const isError = state.value === S.ERROR;
  const isDelivered = state.value === S.DELIVERED;

  return (
    <div className={styles.panel}>
      <div className={styles.label}>WORKFLOW CONTROL</div>

      {isIdle && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="e.g. Calculate 25 x 48"
            aria-label="Request text"
          />
          <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
            Submit input
          </button>
        </form>
      )}

      {!isIdle && (
        <div className={styles.row}>
          <span className={styles.status}>STATE: {state.value}</span>

          {advanceLabel && (
            <button type="button" className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleAdvance}>
              {advanceLabel}
            </button>
          )}

          {failureAction && (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonDanger}`}
              onClick={() => dispatch({ type: failureAction })}
            >
              Force failure here
            </button>
          )}

          {isError && (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => dispatch({ type: 'RETRY' })}
            >
              Retry
            </button>
          )}

          {(!isIdle || isDelivered) && (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => dispatch({ type: 'RESET' })}
            >
              Reset
            </button>
          )}
        </div>
      )}

      {isError && <div className={styles.errorBox}>ERROR — {state.error}</div>}
    </div>
  );
}
