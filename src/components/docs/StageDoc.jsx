import styles from './StageDoc.module.css';

export default function StageDoc({ stage }) {
  return (
    <div className={styles.stage} id={`stage-${stage.id.toLowerCase()}`}>
      <div className={styles.header}>
        <span className={styles.number}>{stage.number}</span>
        <h3 className={styles.title}>{stage.title}</h3>
      </div>
      <p className={styles.purpose}>{stage.purpose}</p>

      <div className={styles.grid}>
        <div className={styles.block}>
          <div className={styles.blockLabel}>INPUTS</div>
          <ul className={styles.list}>
            {stage.inputs.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.block}>
          <div className={styles.blockLabel}>OUTPUTS</div>
          <ul className={styles.list}>
            {stage.outputs.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.block}>
          <div className={styles.blockLabel}>PROCESSING</div>
          <ul className={styles.list}>
            {stage.processing.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.block}>
          <div className={styles.blockLabel}>FAILURE CASES</div>
          <ul className={`${styles.list} ${styles.edgeCases}`}>
            {stage.edgeCases.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.example}>{stage.example}</div>
      </div>
    </div>
  );
}
