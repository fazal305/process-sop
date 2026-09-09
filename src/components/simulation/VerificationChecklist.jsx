import styles from './VerificationChecklist.module.css';

export default function VerificationChecklist({ checks }) {
  return (
    <ul className={styles.list}>
      {checks.map((check) => (
        <li key={check.id} className={`${styles.item} ${check.pass ? styles.pass : styles.fail}`}>
          <span className={styles.mark} aria-hidden="true">
            {check.pass ? '✓' : '✕'}
          </span>
          <span>{check.label}</span>
        </li>
      ))}
    </ul>
  );
}
