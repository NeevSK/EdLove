import { List, Table } from '@repo/ui/components/web';
import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const STUDENTS = [
  { id: 's1', name: 'Amal', present: 18 },
  { id: 's2', name: 'Nila', present: 20 },
];
type Student = (typeof STUDENTS)[number];

const observed: Array<(entries: Array<{ isIntersecting: boolean }>) => void> = [];

afterEach(() => {
  observed.length = 0;
  vi.unstubAllGlobals();
});

describe('web kit: List', () => {
  it('is a named list of items', () => {
    render(
      <List label="Students" items={STUDENTS} keyOf={(s) => s.id} renderItem={(s) => s.name} />,
    );
    const list = screen.getByRole('list', { name: 'Students' });
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Amal', 'Nila']);
  });

  it('is busy with placeholders while loading, and shows its empty state when empty', () => {
    const { rerender } = render(
      <List
        label="Students"
        items={[] as Student[]}
        loading
        keyOf={(s) => s.id}
        renderItem={(s) => s.name}
      />,
    );
    expect(screen.getByRole('list', { name: 'Students' }).getAttribute('aria-busy')).toBe('true');
    rerender(
      <List
        label="Students"
        items={[] as Student[]}
        keyOf={(s) => s.id}
        renderItem={(s) => s.name}
        empty={{ title: 'No students yet' }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'No students yet' })).toBeTruthy();
  });

  it('asks for more when the end scrolls near', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
          observed.push(cb);
        }
        observe() {}
        disconnect() {}
      },
    );
    const onEndReached = vi.fn();
    render(
      <List
        label="Students"
        items={STUDENTS}
        keyOf={(s) => s.id}
        renderItem={(s) => s.name}
        onEndReached={onEndReached}
      />,
    );
    observed.at(-1)?.([{ isIntersecting: true }]);
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });
});

describe('web kit: Table', () => {
  it('is a captioned table with column headers in a focusable, labelled scroll region', () => {
    render(
      <Table
        caption="Attendance this term"
        rows={STUDENTS}
        rowKey={(s) => s.id}
        columns={[
          { key: 'name', header: 'Student', cell: (s) => s.name },
          { key: 'present', header: 'Days present', cell: (s) => s.present, align: 'end' },
        ]}
      />,
    );
    const region = screen.getByRole('region', { name: 'Attendance this term' });
    expect(region.tabIndex).toBe(0);
    const table = screen.getByRole('table', { name: 'Attendance this term' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual(['Student', 'Days present']);
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(screen.getByRole('cell', { name: '20' }).getAttribute('data-align')).toBe('end');
  });

  it('says so when there are no rows', () => {
    render(
      <Table
        caption="Attendance"
        rows={[] as Student[]}
        rowKey={(s) => s.id}
        columns={[{ key: 'name', header: 'Student', cell: (s) => s.name }]}
        empty="No records yet"
      />,
    );
    expect(screen.getByRole('cell', { name: 'No records yet' })).toBeTruthy();
  });
});
