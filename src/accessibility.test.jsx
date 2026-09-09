import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

async function renderAt(path) {
  const { container } = render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  return container;
}

describe('accessibility (axe)', () => {
  it('Overview has no detectable violations', async () => {
    const container = await renderAt('/');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Workflow has no detectable violations', async () => {
    const container = await renderAt('/workflow');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Simulation has no detectable violations', async () => {
    const container = await renderAt('/simulation');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Documentation has no detectable violations', async () => {
    const container = await renderAt('/documentation');
    expect(await axe(container)).toHaveNoViolations();
  });
});
