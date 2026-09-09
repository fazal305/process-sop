import { useReducer, useRef, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import PipelineDiagram from '../components/workflow/PipelineDiagram';
import StageDetailPanel from '../components/workflow/StageDetailPanel';
import OpenRouterSettings from '../components/simulation/OpenRouterSettings';
import RunLog from '../components/simulation/RunLog';
import VerificationChecklist from '../components/simulation/VerificationChecklist';
import ResultCard from '../components/simulation/ResultCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialWorkflowState, workflowReducer, getStageStatuses } from '../lib/workflowMachine';
import { evaluateTools } from '../lib/toolDecisionEngine';
import { simulateToolCall, localSynthesize } from '../lib/synthesize';
import { runVerification } from '../lib/verify';
import { callOpenRouter, OPENROUTER_DEFAULT_MODEL } from '../lib/openrouter';
import { EXAMPLES } from '../lib/examples';
import { STAGES, STAGE_STATUS } from '../lib/constants';

const STATUS_LABEL = {
  [STAGE_STATUS.PENDING]: 'Pending',
  [STAGE_STATUS.ACTIVE]: 'Active',
  [STAGE_STATUS.COMPLETED]: 'Completed',
  [STAGE_STATUS.FAILED]: 'Failed',
  [STAGE_STATUS.SKIPPED]: 'Skipped',
};
import styles from './Simulation.module.css';

function sleep(ms) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return new Promise((resolve) => setTimeout(resolve, reduced ? 0 : ms));
}

let logIdCounter = 0;

export default function Simulation() {
  const [state, dispatch] = useReducer(workflowReducer, initialWorkflowState);
  const [input, setInput] = useState(EXAMPLES[0].input);
  const [activePreset, setActivePreset] = useState(EXAMPLES[0].id);
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const [verification, setVerification] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage('processSop.openrouterKey', '');
  const [model, setModel] = useLocalStorage('processSop.openrouterModel', OPENROUTER_DEFAULT_MODEL);
  const [openStageId, setOpenStageId] = useState(null);
  const runToken = useRef(0);
  const openStage = STAGES.find((stage) => stage.id === openStageId) ?? null;

  const stageStatuses = getStageStatuses(state);

  function pushLog(text, status) {
    logIdCounter += 1;
    const entry = { id: logIdCounter, text, status };
    setLog((prev) => [...prev, entry]);
    return entry.id;
  }

  function settleLog(id, status) {
    setLog((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
  }

  function handleReset() {
    runToken.current += 1;
    dispatch({ type: 'RESET' });
    setLog([]);
    setResult(null);
    setVerification(null);
    setIsRunning(false);
  }

  async function handleRun() {
    const text = input.trim();
    if (!text || isRunning) return;

    const token = ++runToken.current;
    const stillCurrent = () => token === runToken.current;

    dispatch({ type: 'RESET' });
    setLog([]);
    setResult(null);
    setVerification(null);
    setIsRunning(true);

    dispatch({ type: 'SUBMIT_INPUT', payload: text });
    pushLog('Input received.', 'done');
    await sleep(400);
    if (!stillCurrent()) return;

    dispatch({ type: 'ANALYZE_CONTEXT' });
    const contextLog = pushLog('Analyzing context...', 'active');
    await sleep(500);
    if (!stillCurrent()) return;
    settleLog(contextLog, 'done');

    const { tool, toolsRequired } = evaluateTools(text);
    dispatch({ type: 'EVALUATE_TOOLS', payload: { tool, toolsRequired } });
    const toolsLog = pushLog('Evaluating tool requirements...', 'active');
    await sleep(500);
    if (!stillCurrent()) return;
    settleLog(toolsLog, 'done');

    let toolResult = null;
    if (toolsRequired) {
      dispatch({ type: 'RUN_TOOLS' });
      const retrieveLog = pushLog(`Retrieving information via ${tool}...`, 'active');
      await sleep(600);
      if (!stillCurrent()) return;
      toolResult = simulateToolCall(tool, text);
      dispatch({ type: 'TOOLS_COMPLETE' });
      settleLog(retrieveLog, 'done');
    } else {
      dispatch({ type: 'SKIP_TOOLS' });
      pushLog('No external tool required — continuing with available context.', 'done');
    }

    const usingLive = Boolean(apiKey);
    const synthLog = pushLog(
      usingLive ? 'Synthesizing response via OpenRouter...' : 'Synthesizing response (local simulation)...',
      'active',
    );

    let draft;
    let usedLive = false;

    if (usingLive) {
      try {
        draft = await callOpenRouter({ apiKey, model, input: text, toolResult });
        usedLive = true;
        if (!stillCurrent()) return;
        settleLog(synthLog, 'done');
      } catch (error) {
        if (!stillCurrent()) return;
        settleLog(synthLog, 'failed');
        pushLog(`OpenRouter call failed: ${error.message} — falling back to local simulation.`, 'done');
        draft = localSynthesize(text, toolResult);
      }
    } else {
      await sleep(600);
      if (!stillCurrent()) return;
      draft = localSynthesize(text, toolResult);
      settleLog(synthLog, 'done');
    }

    dispatch({ type: 'SYNTHESIZE_COMPLETE' });

    const verifyLog = pushLog('Running verification...', 'active');
    await sleep(500);
    if (!stillCurrent()) return;
    const verificationResult = runVerification({ input: text, toolsRequired, toolResult, draft });
    setVerification(verificationResult);
    settleLog(verifyLog, 'done');

    if (verificationResult.passed) {
      dispatch({ type: 'VERIFICATION_PASS' });
      dispatch({ type: 'DELIVER' });
      setResult({ text: draft, live: usedLive, failed: false });
      pushLog('Response delivered.', 'done');
    } else {
      dispatch({ type: 'VERIFICATION_FAIL', payload: 'One or more checks failed.' });
      setResult({ text: draft, live: usedLive, failed: true });
      pushLog('Verification failed — response held back.', 'failed');
    }

    setIsRunning(false);
  }

  function selectPreset(example) {
    setActivePreset(example.id);
    setInput(example.input);
  }

  return (
    <PageShell
      eyebrow="DEMO"
      title="Simulation"
      subtitle="Run an example request through the full pipeline. Tool retrieval is simulated except for real arithmetic; synthesis is local unless you connect an OpenRouter key below."
    >
      <div className={styles.layout}>
        <OpenRouterSettings apiKey={apiKey} setApiKey={setApiKey} model={model} setModel={setModel} />

        <div className={styles.form}>
          <div className={styles.presetRow}>
            {EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                className={`${styles.presetButton} ${activePreset === example.id ? styles.presetActive : ''}`}
                onClick={() => selectPreset(example)}
              >
                {example.label}
              </button>
            ))}
          </div>

          <textarea
            className={styles.textarea}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setActivePreset(null);
            }}
            aria-label="Request text"
          />

          <div className={styles.actions}>
            <button type="button" className={styles.runButton} onClick={handleRun} disabled={isRunning || !input.trim()}>
              {isRunning ? 'Running…' : 'Run simulation'}
            </button>
            <button type="button" className={styles.resetButton} onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {log.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>RUN LOG</div>
            <RunLog entries={log} />
          </div>
        )}

        <PipelineDiagram stageStatuses={stageStatuses} onSelectStage={setOpenStageId} />

        {verification && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>VERIFICATION</div>
            <VerificationChecklist checks={verification.checks} />
          </div>
        )}

        {result && <ResultCard text={result.text} live={result.live} failed={result.failed} />}
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
