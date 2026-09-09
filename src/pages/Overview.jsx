import PageShell from '../components/ui/PageShell';
import { STAGES } from '../lib/constants';
import styles from './Overview.module.css';

export default function Overview() {
  return (
    <PageShell
      eyebrow="ILLUSTRATIVE PIPELINE"
      title="Information Processing SOP"
      subtitle="From raw input to verified final delivery. A conceptual, deterministic model of how a request should move through reception, context analysis, tool use, synthesis, and verification — not a disclosure of any specific model's internal reasoning."
    >
      <ol className={styles.stageList}>
        {STAGES.map((stage) => (
          <li key={stage.id} className={styles.stageRow}>
            <span className={styles.stageNumber}>{stage.number}</span>
            <div>
              <div className={styles.stageTitle}>{stage.title}</div>
              <p className={styles.stageSummary}>{stage.summary}</p>
            </div>
          </li>
        ))}
        <li className={styles.deliveryRow}>
          <span className={styles.deliveryLabel}>&#10003;</span>
          <div>
            <div className={styles.stageTitle}>Final Delivery</div>
            <p className={styles.stageSummary}>
              Only released once every verification check has passed.
            </p>
          </div>
        </li>
      </ol>
    </PageShell>
  );
}
