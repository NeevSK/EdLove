import { Breadcrumb, SegmentedControl, Tabs } from '@repo/ui/components/web';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

const VIEWS = [
  { value: 'overview', label: 'Overview' },
  { value: 'students', label: 'Students' },
  { value: 'notes', label: 'Notes', disabled: true },
  { value: 'files', label: 'Files' },
] as const;

type View = (typeof VIEWS)[number]['value'];

function TabsDemo() {
  const [value, setValue] = useState<View>('overview');
  return (
    <Tabs label="Class views" value={value} tabs={VIEWS} onChange={setValue}>
      <p>{value} content</p>
    </Tabs>
  );
}

describe('web kit: Tabs', () => {
  it('is a named tablist with one tab stop; the panel is labelled by its tab', () => {
    render(<TabsDemo />);
    screen.getByRole('tablist', { name: 'Class views' });
    const tabs = screen.getAllByRole('tab');
    expect(tabs.filter((t) => t.tabIndex === 0)).toHaveLength(1);
    const panel = screen.getByRole('tabpanel', { name: 'Overview' });
    expect(panel.textContent).toBe('overview content');
  });

  it('arrow keys move and select, skipping disabled tabs; Home and End jump', async () => {
    render(<TabsDemo />);
    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Students' }).getAttribute('aria-selected')).toBe(
      'true',
    );
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Files' }).getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Files' }));
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeTruthy();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tabpanel', { name: 'Files' })).toBeTruthy();
  });
});

function SegmentedDemo() {
  const [value, setValue] = useState<'day' | 'week' | 'term'>('day');
  return (
    <SegmentedControl
      label="Range"
      value={value}
      onChange={setValue}
      options={[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'term', label: 'Term' },
      ]}
    />
  );
}

describe('web kit: SegmentedControl', () => {
  it('is a named radio group; arrows move the choice and wrap', async () => {
    render(<SegmentedDemo />);
    screen.getByRole('radiogroup', { name: 'Range' });
    await userEvent.click(screen.getByRole('radio', { name: 'Day' }));
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Term' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getAllByRole('radio').filter((r) => r.tabIndex === 0)).toHaveLength(1);
  });
});

describe('web kit: Breadcrumb', () => {
  it('is a labelled nav; earlier steps link, the last is the current page', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Workspace', href: '/workspace' },
          { label: 'Grade 6A', href: '/workspace/6a' },
          { label: 'Attendance' },
        ]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav.querySelectorAll('li')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Grade 6A' }).getAttribute('href')).toBe(
      '/workspace/6a',
    );
    expect(screen.getByText('Attendance').getAttribute('aria-current')).toBe('page');
    expect(screen.queryByRole('link', { name: 'Attendance' })).toBeNull();
  });
});
