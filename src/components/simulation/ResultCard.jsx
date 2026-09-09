import styles from './ResultCard.module.css';

export default function ResultCard({ text, live, failed }) {
  return (
    <div className={`${styles.card} ${failed ? styles.cardFailed : ''}`}>
      <div className={styles.header}>
        <span className={styles.label}>{failed ? 'DELIVERY BLOCKED' : 'FINAL RESPONSE'}</span>
        {!failed && <span className={styles.badge}>{live ? 'LIVE — OpenRouter' : 'SIMULATION'}</span>}
      </div>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
