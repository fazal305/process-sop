import { useState } from 'react';
import { OPENROUTER_DEFAULT_MODEL } from '../../lib/openrouter';
import styles from './OpenRouterSettings.module.css';

const OPENROUTER_KEY_PATTERN = /^sk-or-/;

function getKeyFormatError(value) {
  const trimmed = value.trim();
  if (!trimmed) return null; // empty is allowed — falls back to local simulation
  if (!OPENROUTER_KEY_PATTERN.test(trimmed)) {
    return 'This doesn’t look like a valid OpenRouter key (expected to start with "sk-or-"). Double-check it before saving.';
  }
  return null;
}

export default function OpenRouterSettings({ apiKey, setApiKey, model, setModel }) {
  const [open, setOpen] = useState(false);
  const [draftKey, setDraftKey] = useState(apiKey);
  const [draftModel, setDraftModel] = useState(model || OPENROUTER_DEFAULT_MODEL);
  const [reveal, setReveal] = useState(false);
  const [keyError, setKeyError] = useState(() => getKeyFormatError(apiKey || ''));

  const connected = Boolean(apiKey);

  function handleKeyChange(event) {
    const value = event.target.value;
    setDraftKey(value);
    setKeyError(getKeyFormatError(value));
  }

  function handleSave() {
    const error = getKeyFormatError(draftKey);
    setKeyError(error);
    if (error) return;
    setApiKey(draftKey.trim());
    setModel(draftModel.trim() || OPENROUTER_DEFAULT_MODEL);
  }

  function handleClear() {
    setDraftKey('');
    setKeyError(null);
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
                onChange={handleKeyChange}
                placeholder="sk-or-..."
                autoComplete="off"
                aria-invalid={keyError ? 'true' : 'false'}
                aria-describedby={keyError ? 'openrouter-key-error' : undefined}
              />
              <button type="button" className={styles.smallButton} onClick={() => setReveal((v) => !v)}>
                {reveal ? 'Hide' : 'Show'}
              </button>
            </div>
            {keyError && (
              <p id="openrouter-key-error" className={styles.fieldError} role="alert">
                {keyError}
              </p>
            )}
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
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={handleSave}
              disabled={Boolean(keyError)}
            >
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
