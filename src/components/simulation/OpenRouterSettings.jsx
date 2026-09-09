import { useState } from 'react';
import { OPENROUTER_DEFAULT_MODEL } from '../../lib/openrouter';
import styles from './OpenRouterSettings.module.css';

export default function OpenRouterSettings({ apiKey, setApiKey, model, setModel }) {
  const [open, setOpen] = useState(false);
  const [draftKey, setDraftKey] = useState(apiKey);
  const [draftModel, setDraftModel] = useState(model || OPENROUTER_DEFAULT_MODEL);
  const [reveal, setReveal] = useState(false);

  const connected = Boolean(apiKey);

  function handleSave() {
    setApiKey(draftKey.trim());
    setModel(draftModel.trim() || OPENROUTER_DEFAULT_MODEL);
  }

  function handleClear() {
    setDraftKey('');
    setApiKey('');
  }

  return (
    <div className={styles.panel}>
      <button type="button" className={styles.toggle} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>
          <span className={`${styles.statusDot} ${connected ? styles.statusConnected : ''}`} aria-hidden="true" />
          OpenRouter: {connected ? 'Connected' : 'Not connected (using local simulation)'}
        </span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className={styles.body}>
          <p className={styles.note}>
            Optional. Paste your own OpenRouter API key to let the Content Synthesis stage call a
            real model for its draft response. The key is stored only in this browser&#39;s
            localStorage and is sent directly to openrouter.ai — never to any server this site
            controls. Leave it empty to keep using the local, deterministic simulation.
          </p>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="openrouter-key">
              API key
            </label>
            <div className={styles.inputRow}>
              <input
                id="openrouter-key"
                className={styles.input}
                type={reveal ? 'text' : 'password'}
                value={draftKey}
                onChange={(event) => setDraftKey(event.target.value)}
                placeholder="sk-or-..."
                autoComplete="off"
              />
              <button type="button" className={styles.smallButton} onClick={() => setReveal((v) => !v)}>
                {reveal ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="openrouter-model">
              Model
            </label>
            <input
              id="openrouter-model"
              className={styles.input}
              value={draftModel}
              onChange={(event) => setDraftModel(event.target.value)}
              placeholder={OPENROUTER_DEFAULT_MODEL}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.buttonPrimary} onClick={handleSave}>
              Save
            </button>
            <button type="button" className={styles.buttonGhost} onClick={handleClear}>
              Clear key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
