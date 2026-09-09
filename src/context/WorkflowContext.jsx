import { createContext, useContext, useMemo, useReducer } from 'react';
import { initialWorkflowState, workflowReducer, getStageStatuses } from '../lib/workflowMachine';

const WorkflowContext = createContext(null);

export function WorkflowProvider({ children }) {
  const [state, dispatch] = useReducer(workflowReducer, initialWorkflowState);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      stageStatuses: getStageStatuses(state),
    }),
    [state],
  );

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within a WorkflowProvider');
  return ctx;
}
