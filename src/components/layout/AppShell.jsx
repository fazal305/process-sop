import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styles from './AppShell.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/workflow', label: 'Workflow' },
  { to: '/simulation', label: 'Simulation' },
  { to: '/documentation', label: 'Documentation' },
  { to: '/about', label: 'About' },
];

function navLinkClassName({ isActive }) {
  return isActive ? `${styles.link} ${styles.linkActive}` : styles.link;
}

function mobileNavLinkClassName({ isActive }) {
  return isActive ? `${styles.mobileLink} ${styles.mobileLinkActive}` : styles.mobileLink;
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className={styles.nav}>
        <div className={styles.navInner}>
          <NavLink to="/" className={styles.brand} aria-label="Information Processing SOP — home">
            <span className={styles.brandMark}>&#9635;</span>
            <span>PROCESS&#183;SOP</span>
          </NavLink>

          <nav className={styles.links} aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClassName}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={styles.menuIcon} aria-hidden="true">
              {menuOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" className={styles.mobileMenu} aria-label="Primary (mobile)">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={mobileNavLinkClassName}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>INFORMATION PROCESSING SOP — ILLUSTRATIVE PIPELINE</span>
          <span>NOT AN EXPOSURE OF ANY MODEL&#39;S ACTUAL INTERNAL REASONING</span>
        </div>
      </footer>
    </div>
  );
}
