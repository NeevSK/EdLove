import { Disclosure, Notice, NumberStepper, SearchField, Steps } from '@repo/ui/components/web';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('web kit: basic pieces', () => {
  it('Disclosure is a native details element with its summary', () => {
    const { container } = render(
      <Disclosure title="Rubric" summary="4 criteria">
        <p>Criterion one</p>
      </Disclosure>,
    );
    const details = container.querySelector('details');
    expect(details?.open).toBe(false);
    expect(screen.getByText('4 criteria').closest('summary')).toBeTruthy();
  });

  it('Notice: danger is an alert, others a status; dismiss is named', async () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Notice tone="danger" message="Not saved" onDismiss={onDismiss} />);
    expect(screen.getByRole('alert').getAttribute('data-tone')).toBe('danger');
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalled();
    rerender(<Notice message="Saved on this device" />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('SearchField is a search landmark that clears and says its count', async () => {
    const onChange = vi.fn();
    render(<SearchField label="Search students" value="Nim" onChange={onChange} resultCount={1} />);
    expect(screen.getByRole('search')).toBeTruthy();
    const box = screen.getByRole('searchbox', { name: 'Search students' });
    expect(box.getAttribute('aria-describedby')).toBe(screen.getByText('1 result').id);
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('NumberStepper keeps typed numbers to bounds and step, and stops at the edges', () => {
    const onChange = vi.fn();
    render(
      <NumberStepper label="Duration" value={40} onChange={onChange} min={10} max={40} step={5} />,
    );
    const more = screen.getByRole('button', { name: 'Increase, Duration' }) as HTMLButtonElement;
    expect(more.disabled).toBe(true);
    const input = screen.getByRole('spinbutton', { name: 'Duration' });
    fireEvent.change(input, { target: { value: '23' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(25);
    expect(screen.getByRole('group', { name: 'Duration' })).toBeTruthy();
  });

  it('Steps marks the current step and offers only reached ones', async () => {
    const onSelect = vi.fn();
    render(
      <Steps
        label="New quiz"
        current={1}
        onSelect={onSelect}
        steps={[
          { key: 'a', label: 'Details', state: 'done' },
          { key: 'b', label: 'Questions' },
          { key: 'c', label: 'Review' },
        ]}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'New quiz' })).toBeTruthy();
    const items = screen.getAllByRole('listitem');
    expect(items[1]?.getAttribute('aria-current')).toBe('step');
    await userEvent.click(screen.getByRole('button', { name: 'Step 1 of 3, Details, Done' }));
    expect(onSelect).toHaveBeenCalledWith(0);
    expect(screen.queryByRole('button', { name: /Review/ })).toBeNull();
  });
});
