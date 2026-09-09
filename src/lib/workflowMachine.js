import { STAGE_STATUS, WORKFLOW_STATE as S } from './constants';

// Explicit transition table: currentState -> { ACTION: nextState }.
// Any action not listed for the current state is rejected by the reducer,
// so the UI can never dispatch its way into an impossible state.
const TRANSITIONS = {
  [S.IDLE]: {
    SUBMIT_INPUT: S.INPUT_RECEIVED,
  },
  [S.INPUT_RECEIVED]: {
    ANALYZE_CONTEXT: S.CONTEXT_ANALYZED,
    RESET: S.IDLE,
  },
  [S.CONTEXT_ANALYZED]: {
    EVALUATE_TOOLS: S.TOOLS_EVALUATED,
    RESET: S.IDLE,
  },
  [S.TOOLS_EVALUATED]: {
    RUN_TOOLS: S.TOOLS_RUNNING,
    SKIP_TOOLS: S.SYNTHESIZING,
    RESET: S.IDLE,
  },
  [S.TOOLS_RUNNING]: {
    TOOLS_COMPLETE: S.SYNTHESIZING,
    TOOL_FAILURE: S.ERROR,
    RESET: S.IDLE,
  },
  [S.SYNTHESIZING]: {
    SYNTHESIZE_COMPLETE: S.VERIFYING,
    SYNTHESIS_FAILURE: S.ERROR,
    RESET: S.IDLE,
  },
  [S.VERIFYING]: {
    VERIFICATION_PASS: S.READY,
    VERIFICATION_FAIL: S.ERROR,
    RESET: S.IDLE,
  },
  [S.READY]: {
    DELIVER: S.DELIVERED,
    RESET: S.IDLE,
  },
  [S.DELIVERED]: {
    RESET: S.IDLE,
  },
  [S.ERROR]: {
    RETRY: null, // resolved dynamically to state.failedFrom
    RESET: S.IDLE,
  },
};

// Maps the current workflow state to a status per pipeline stage, for the
// visualization. A stage is ACTIVE only while the machine is inside it;
// everything the machine has already passed through is COMPLETED.
const STATE_ORDER = [
  S.INPUT_RECEIVED,
  S.CONTEXT_ANALYZED,
  S.TOOLS_EVALUATED,
  S.TOOLS_RUNNING,
  S.SYNTHESIZING,
  S.VERIFYING,
  S.READY,
];

const STAGE_OF_STATE = {
  [S.INPUT_RECEIVED]: 'INPUT',
  [S.CONTEXT_ANALYZED]: 'CONTEXT',
  [S.TOOLS_EVALUATED]: 'TOOLS',
  [S.TOOLS_RUNNING]: 'TOOLS',
  [S.SYNTHESIZING]: 'SYNTHESIS',
  [S.VERIFYING]: 'VERIFICATION',
  [S.READY]: 'VERIFICATION',
};

const STAGE_SEQUENCE = ['INPUT', 'CONTEXT', 'TOOLS', 'SYNTHESIS', 'VERIFICATION'];

export const initialWorkflowState = {
  value: S.IDLE,
  input: '',
  toolsRequired: false,
  selectedTool: null,
  error: null,
  failedFrom: null,
  history: [],
};

export function workflowReducer(state, action) {
  const allowed = TRANSITIONS[state.value];
  const nextValue = allowed?.[action.type];

  if (nextValue === undefined) {
    // Not a legal transition from the current state — ignore rather than
    // corrupt the machine into an unreachable combination.
    return state;
  }

  const resolvedNext = action.type === 'RETRY' ? state.failedFrom ?? S.IDLE : nextValue;

  const base = {
    ...state,
    value: resolvedNext,
    history: [...state.history, { from: state.value, action: action.type, to: resolvedNext }],
  };

  switch (action.type) {
    case 'SUBMIT_INPUT':
      return { ...initialWorkflowState, value: resolvedNext, input: action.payload, history: base.history };
    case 'EVALUATE_TOOLS':
      return { ...base, toolsRequired: action.payload.toolsRequired, selectedTool: action.payload.tool ?? null };
    case 'TOOL_FAILURE':
      return { ...base, error: action.payload ?? 'Tool invocation failed.', failedFrom: S.TOOLS_RUNNING };
    case 'SYNTHESIS_FAILURE':
      return { ...base, error: action.payload ?? 'Synthesis failed.', failedFrom: S.SYNTHESIZING };
    case 'VERIFICATION_FAIL':
      return { ...base, error: action.payload ?? 'Verification failed.', failedFrom: S.VERIFYING };
    case 'RETRY':
      return { ...base, error: null, failedFrom: null };
    case 'RESET':
      return { ...initialWorkflowState };
    default:
      return base;
  }
}

// Derives a STAGE_STATUS for every pipeline stage plus 'DELIVERY',
// given the current machine state.
export function getStageStatuses(state) {
  const statuses = {};
  const isDelivered = state.value === S.DELIVERED;
  // DELIVERED has no stage of its own — it's reached only after every
  // pipeline stage has completed, so treat it like a completed READY.
  const effectiveStageState = isDelivered ? S.READY : state.value;
  const currentStageId = STAGE_OF_STATE[effectiveStageState] ?? null;
  const currentIndex = currentStageId ? STAGE_SEQUENCE.indexOf(currentStageId) : -1;
  const isError = state.value === S.ERROR;
  const failedStageId = isError ? STAGE_OF_STATE[state.failedFrom] ?? null : null;
  const failedIndex = failedStageId ? STAGE_SEQUENCE.indexOf(failedStageId) : -1;

  STAGE_SEQUENCE.forEach((id, index) => {
    if (isError) {
      if (index < failedIndex) statuses[id] = STAGE_STATUS.COMPLETED;
      else if (index === failedIndex) statuses[id] = STAGE_STATUS.FAILED;
      else statuses[id] = STAGE_STATUS.PENDING;
      return;
    }

    if (state.value === S.IDLE) {
      statuses[id] = STAGE_STATUS.PENDING;
      return;
    }

    if (id === 'TOOLS' && !state.toolsRequired && currentIndex > index) {
      statuses[id] = STAGE_STATUS.SKIPPED;
      return;
    }

    if (index < currentIndex) statuses[id] = STAGE_STATUS.COMPLETED;
    else if (index === currentIndex) {
      statuses[id] =
        effectiveStageState === S.READY ? STAGE_STATUS.COMPLETED : STAGE_STATUS.ACTIVE;
    } else statuses[id] = STAGE_STATUS.PENDING;
  });

  statuses.DELIVERY =
    state.value === S.DELIVERED
      ? STAGE_STATUS.COMPLETED
      : state.value === S.READY
        ? STAGE_STATUS.ACTIVE
        : STAGE_STATUS.PENDING;

  return statuses;
}

export { STATE_ORDER, STAGE_SEQUENCE };
