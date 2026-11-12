import type { FloorNode, PatternId } from '@repo/core/logic/floor';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { WorldScope } from '../../../theme/native';
import { WORLD_IDS } from '../../../theme/worlds';
import { PatternBody } from '../Floor/patterns';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));

const node = (id: string, extra: Partial<FloorNode['piece']> = {}): FloorNode => ({
  id,
  level: 'piece',
  label: id,
  footprint: { width: 'full', height: 80 } as unknown as FloorNode['footprint'],
  weight: 1,
  cost: { views: 1 } as FloorNode['cost'],
  motion: 'none' as FloorNode['motion'],
  depth: ['light'],
  placement: 'first-screen',
  why: [],
  children: [],
  piece: { id, label: id, group: 'g', fit: {} as never, ...extra },
});

const pieces = [node('A'), node('B', { lit: true, time: 'later' }), node('C', { time: 'now' })];
const wrap = (n: React.ReactNode) => (
  <WorldScope world={WORLD_IDS[0]!} phase="morning" mode="light">
    {n}
  </WorldScope>
);
const drawn = () => screen.getAllByText(/^[ABC]$/).map((n) => n.props.children as string);

const ALL: PatternId[] = [
  'hero',
  'lamp',
  'stream',
  'tile-grid',
  'mixed-tiles',
  'shelf',
  'circle-rail',
  'chip-rail',
  'grouped-list',
  'path',
  'day-river',
  'pinboard',
  'list-detail',
  'desk',
  'board',
];

describe('PatternBody', { tags: ['unit', 'a11y'] }, () => {
  for (const pattern of ALL) {
    it(`${pattern} draws every piece`, async () => {
      await render(
        wrap(
          <PatternBody
            pattern={pattern}
            pieces={pieces}
            renderPiece={(p) => <Text>{p.label}</Text>}
          />,
        ),
      );
      expect([...drawn()].sort()).toEqual(['A', 'B', 'C']);
    });
  }

  it('keeps reading order where the pattern has no reason to change it', async () => {
    await render(
      wrap(
        <PatternBody
          pattern="grouped-list"
          pieces={pieces}
          renderPiece={(p) => <Text>{p.label}</Text>}
        />,
      ),
    );
    expect(drawn()).toEqual(['A', 'B', 'C']);
  });

  it('lamp puts the lit piece first', async () => {
    await render(
      wrap(
        <PatternBody pattern="lamp" pieces={pieces} renderPiece={(p) => <Text>{p.label}</Text>} />,
      ),
    );
    expect(drawn()[0]).toBe('B');
  });

  it('day-river sorts pieces into now, later and any time, under headings', async () => {
    await render(
      wrap(
        <PatternBody
          pattern="day-river"
          pieces={pieces}
          renderPiece={(p) => <Text>{p.label}</Text>}
        />,
      ),
    );
    expect(screen.getAllByRole('header').map((h) => h.props.children)).toEqual([
      'Now',
      'Later today',
      'Any time',
    ]);
    expect(drawn()).toEqual(['C', 'B', 'A']);
  });

  it('one-at-a-time shows one step and walks to the next and back', async () => {
    await render(
      wrap(
        <PatternBody
          pattern="one-at-a-time"
          pieces={pieces}
          renderPiece={(p) => <Text>{p.label}</Text>}
        />,
      ),
    );
    expect(drawn()).toEqual(['A']);
    expect(screen.getByText('1 of 3')).toBeTruthy();
    await fireEvent.press(screen.getByText('Next'));
    expect(drawn()).toEqual(['B']);
    expect(screen.getByText('2 of 3')).toBeTruthy();
    await fireEvent.press(screen.getByText('Previous'));
    expect(drawn()).toEqual(['A']);
  });

  it('uses the translated words it is given', async () => {
    await render(
      wrap(
        <PatternBody
          pattern="one-at-a-time"
          pieces={pieces}
          renderPiece={(p) => <Text>{p.label}</Text>}
          words={{ place: (n, t) => `${n}/${t}`, next: 'ඊළඟ' }}
        />,
      ),
    );
    expect(screen.getByText('1/3')).toBeTruthy();
    expect(screen.getByText('ඊළඟ')).toBeTruthy();
  });
});
