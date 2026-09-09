import styles from './PageShell.module.css';

export default function PageShell({ eyebrow, title, subtitle, children }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
