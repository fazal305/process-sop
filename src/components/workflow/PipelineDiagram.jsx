import { STAGES, STAGE_STATUS } from '../../lib/constants';
import styles from './PipelineDiagram.module.css';

const STATUS_LABEL = {
  [STAGE_STATUS.PENDING]: 'Pending',
  [STAGE_STATUS.ACTIVE]: 'Active',
  [STAGE_STATUS.COMPLETED]: 'Completed',
  [STAGE_STATUS.FAILED]: 'Failed',
  [STAGE_STATUS.SKIPPED]: 'Skipped',
};

const STATUS_MARK = {
  [STAGE_STATUS.PENDING]: '',
  [STAGE_STATUS.ACTIVE]: '●',
  [STAGE_STATUS.COMPLETED]: '✓',
  [STAGE_STATUS.FAILED]: '✕',
  [STAGE_STATUS.SKIPPED]: '–',
};

function markerClass(status) {
  return {
    [STAGE_STATUS.ACTIVE]: styles.markerActive,
    [STAGE_STATUS.COMPLETED]: styles.markerCompleted,
    [STAGE_STATUS.FAILED]: styles.markerFailed,
    [STAGE_STATUS.SKIPPED]: styles.markerSkipped,
  }[status];
}

function cardClass(status) {
  return {
    [STAGE_STATUS.ACTIVE]: styles.cardActive,
    [STAGE_STATUS.FAILED]: styles.cardFailed,
  }[status];
}

function statusBadgeClass(status) {
  return {
    [STAGE_STATUS.ACTIVE]: styles.statusActive,
    [STAGE_STATUS.COMPLETED]: styles.statusCompleted,
    [STAGE_STATUS.FAILED]: styles.statusFailed,
    [STAGE_STATUS.SKIPPED]: styles.statusSkipped,
  }[status];
}

export default function PipelineDiagram({ stageStatuses, onSelectStage }) {
  const items = [...STAGES, { id: 'DELIVERY', number: '', title: 'Final Delivery', summary: 'Released only after every verification check has passed.' }];

  return (
    <ol className={styles.pipeline} aria-label="Information processing pipeline">
      {items.map((stage, index) => {
        const status = stageStatuses[stage.id] ?? STAGE_STATUS.PENDING;
        const isLast = index === items.length - 1;
        const isDelivery = stage.id === 'DELIVERY';

        return (
          <li key={stage.id} className={styles.step}>
            <div className={styles.rail} aria-hidden="true">
              <span className={`${styles.marker} ${markerClass(status) ?? ''}`}>
                {STATUS_MARK[status]}
              </span>
              {!isLast && <span className={styles.connector} />}
            </div>

            {isDelivery ? (
              <div className={`${styles.card} ${cardClass(status) ?? ''}`}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardTitle}>{stage.title}</div>
                    <p className={styles.cardSummary}>{stage.summary}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${statusBadgeClass(status) ?? ''}`}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={`${styles.card} ${cardClass(status) ?? ''}`}
                onClick={() => onSelectStage(stage.id)}
                aria-haspopup="dialog"
              >
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.cardNumber}>{stage.number}</span>
                    <div className={styles.cardTitle}>{stage.title}</div>
                  </div>
                  <span className={`${styles.statusBadge} ${statusBadgeClass(status) ?? ''}`}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <p className={styles.cardSummary}>{stage.summary}</p>
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}
