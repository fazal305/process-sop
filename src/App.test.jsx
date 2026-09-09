import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  it('renders the Overview page at /', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: 'Information Processing SOP' })).toBeInTheDocument();
  });

  it('renders each primary route without crashing', () => {
    for (const path of ['/workflow', '/simulation', '/documentation', '/about']) {
      const { unmount } = renderAt(path);
      unmount();
    }
  });

  it('renders a 404 page for an unknown route', () => {
    renderAt('/does-not-exist');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('exposes primary navigation landmarks', () => {
    renderAt('/');
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
