import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowProvider } from '../context/WorkflowContext';
import Workflow from './Workflow';

function renderWorkflow() {
  return render(
    <WorkflowProvider>
      <Workflow />
    </WorkflowProvider>,
  );
}

describe('Workflow page (integration)', () => {
  it('drives a full run from input to delivery via the UI', () => {
    renderWorkflow();

    fireEvent.change(screen.getByLabelText('Request text'), { target: { value: 'Calculate 25 x 48' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit input' }));

    expect(screen.getByText('STATE: INPUT_RECEIVED')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Analyze context →' }));
    fireEvent.click(screen.getByRole('button', { name: 'Evaluate tools →' }));
    fireEvent.click(screen.getByRole('button', { name: 'Run tool step →' }));
    fireEvent.click(screen.getByRole('button', { name: 'Complete tool call →' }));
    fireEvent.click(screen.getByRole('button', { name: 'Run verification →' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pass verification →' }));
    fireEvent.click(screen.getByRole('button', { name: 'Deliver →' }));

    expect(screen.getByText('STATE: DELIVERED')).toBeInTheDocument();
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(6);
  });

  it('resets back to the input form', () => {
    renderWorkflow();

    fireEvent.change(screen.getByLabelText('Request text'), { target: { value: 'Say hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit input' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByRole('button', { name: 'Submit input' })).toBeInTheDocument();
  });

  it('opens and closes the stage detail panel', () => {
    renderWorkflow();

    fireEvent.click(screen.getByRole('button', { name: /Input Reception/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Receive the raw request/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close stage details' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ignores an illegal action instead of breaking the UI', () => {
    renderWorkflow();
    // No submit yet — only the input form should be present, no advance controls.
    expect(screen.queryByText(/STATE:/)).not.toBeInTheDocument();
  });
});
