import styles from './RunLog.module.css';

const MARK = {
  pending: '·',
  active: '…',
  done: '✓',
  failed: '✕',
};

export default function RunLog({ entries }) {
  if (entries.length === 0) return null;

  return (
    <ol className={styles.log} aria-live="polite" aria-label="Simulation run log">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className={`${styles.entry} ${entry.status === 'done' ? styles.entryDone : ''} ${
            entry.status === 'failed' ? styles.entryFailed : ''
          } ${entry.status === 'active' ? styles.entryActive : ''}`}
        >
          <span className={styles.mark} aria-hidden="true">
            {MARK[entry.status]}
          </span>
          <span>{entry.text}</span>
        </li>
      ))}
    </ol>
  );
}
