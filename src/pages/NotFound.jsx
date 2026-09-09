import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';

export default function NotFound() {
  return (
    <PageShell eyebrow="404" title="Page not found" subtitle="There's no stage, route, or document at this address.">
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        <Link to="/" style={{ color: 'var(--color-primary)' }}>
          Return to the overview
        </Link>
      </p>
    </PageShell>
  );
}
