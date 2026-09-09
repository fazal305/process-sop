import { useEffect, useRef } from 'react';
import styles from './StageDetailPanel.module.css';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function StageDetailPanel({ stage, statusLabel, onClose }) {
  const closeRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  if (!stage) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-panel-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}>
              STAGE {stage.number} — {statusLabel}
            </span>
            <h2 id="stage-panel-title" className={styles.title}>
              {stage.title}
            </h2>
          </div>
          <button ref={closeRef} type="button" className={styles.closeButton} onClick={onClose} aria-label="Close stage details">
            &#10005;
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>PURPOSE</div>
          <p className={styles.sectionBody}>{stage.purpose}</p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>INPUTS</div>
          <ul className={styles.list}>
            {stage.inputs.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>PROCESSING</div>
          <ul className={styles.list}>
            {stage.processing.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>OUTPUTS</div>
          <ul className={styles.list}>
            {stage.outputs.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>RULES</div>
          <ul className={styles.list}>
            {stage.rules.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>EDGE CASES</div>
          <ul className={styles.list}>
            {stage.edgeCases.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>EXAMPLE</div>
          <div className={styles.example}>{stage.example}</div>
        </div>
      </div>
    </div>
  );
}
