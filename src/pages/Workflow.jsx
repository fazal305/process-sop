import { useState } from 'react';
import PageShell from '../components/ui/PageShell';
import PipelineDiagram from '../components/workflow/PipelineDiagram';
import StageDetailPanel from '../components/workflow/StageDetailPanel';
import WorkflowControls from '../components/workflow/WorkflowControls';
import { useWorkflow } from '../context/WorkflowContext';
import { STAGES, STAGE_STATUS } from '../lib/constants';

const STATUS_LABEL = {
  [STAGE_STATUS.PENDING]: 'Pending',
  [STAGE_STATUS.ACTIVE]: 'Active',
  [STAGE_STATUS.COMPLETED]: 'Completed',
  [STAGE_STATUS.FAILED]: 'Failed',
  [STAGE_STATUS.SKIPPED]: 'Skipped',
};

export default function Workflow() {
  const { state, dispatch, stageStatuses } = useWorkflow();
  const [openStageId, setOpenStageId] = useState(null);

  const openStage = STAGES.find((stage) => stage.id === openStageId) ?? null;

  return (
    <PageShell
      eyebrow="INTERACTIVE"
      title="Workflow"
      subtitle="Drive the pipeline manually to see how the state machine moves — and refuses to move — between stages. Click any stage for its full purpose, inputs, processing, and rules."
    >
      <div style={{ display: 'grid', gap: 'var(--space-6)', maxWidth: '720px' }}>
        <WorkflowControls state={state} dispatch={dispatch} />
        <PipelineDiagram stageStatuses={stageStatuses} onSelectStage={setOpenStageId} />
      </div>

      {openStage && (
        <StageDetailPanel
          stage={openStage}
          statusLabel={STATUS_LABEL[stageStatuses[openStage.id]]}
          onClose={() => setOpenStageId(null)}
        />
      )}
    </PageShell>
  );
}
