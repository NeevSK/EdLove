import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { List } from '../List/List';
import { Table } from '../Table/Table';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn() }));

const STUDENTS = [
  { id: 's1', name: 'Amal', present: 18 },
  { id: 's2', name: 'Nila', present: 20 },
];

describe('List', { tags: ['a11y', 'unit'] }, () => {
  it('while the first page loads it is a busy, named list of placeholders', async () => {
    await render(
      <List
        label="Students"
        items={[]}
        loading
        keyOf={(s: (typeof STUDENTS)[number]) => s.id}
        renderItem={(s) => <Text>{s.name}</Text>}
      />,
    );
    const list = screen.getByLabelText('Students');
    expect(list.props.role).toBe('list');
    expect(list.props['aria-busy']).toBe(true);
  });

  it('an empty list says so with its empty state', async () => {
    await render(
      <List
        label="Students"
        items={[]}
        keyOf={(s: (typeof STUDENTS)[number]) => s.id}
        renderItem={(s) => <Text>{s.name}</Text>}
        empty={{ title: 'No students yet', message: 'Invite your class.' }}
      />,
    );
    expect(screen.getByText('No students yet')).toBeTruthy();
  });
});

describe('Table', { tags: ['a11y', 'unit'] }, () => {
  it('is a named table with column headers, rows and cells', async () => {
    await render(
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
    expect(screen.getByLabelText('Attendance this term').props.role).toBe('table');
    expect(screen.getByText('Student').parent?.props.role).toBe('columnheader');
    expect(screen.getByText('Nila').parent?.props.role).toBe('cell');
    expect(screen.getByText('20')).toBeTruthy();
  });

  it('says so when there are no rows', async () => {
    await render(
      <Table
        caption="Attendance"
        rows={[] as typeof STUDENTS}
        rowKey={(s) => s.id}
        columns={[{ key: 'name', header: 'Student', cell: (s) => s.name }]}
        empty="No records yet"
      />,
    );
    expect(screen.getByText('No records yet')).toBeTruthy();
  });
});
