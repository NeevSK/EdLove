import { describe, expect, it } from 'vitest';
import { libraryPort, searchShelf, type ShelfItem, subjectsOf } from '../port';

const item = (id: string, title: string, subjects: string[]): ShelfItem => ({
  id,
  title,
  summary: '',
  kind: 'pdf',
  subjects,
  official: false,
  verified: false,
});

describe('library port', () => {
  it('starts on samples and maps them to shelf items', async () => {
    const port = libraryPort.get();
    expect(port.source).toBe('sample');
    const shelf = await port.shelf();
    expect(shelf.length).toBeGreaterThan(0);
    expect(shelf.every((s) => s.id && s.title)).toBe(true);
    const cols = await port.collections();
    expect(cols.length).toBeGreaterThan(0);
  });

  it('swaps to another source and back', async () => {
    libraryPort.use({ source: 'server', shelf: async () => [], collections: async () => [] });
    expect(libraryPort.get().source).toBe('server');
    libraryPort.reset();
    expect(libraryPort.get().source).toBe('sample');
  });

  it('orders subjects by use and searches every word', () => {
    const items = [
      item('a', 'Maths one', ['Maths']),
      item('b', 'Maths two', ['Maths', 'Art']),
      item('c', 'Art', ['Art', 'Values']),
    ];
    expect(subjectsOf(items)).toEqual(['Art', 'Maths', 'Values']);
    expect(searchShelf(items, 'maths two').map((i) => i.id)).toEqual(['b']);
    expect(searchShelf(items, '  ').length).toBe(3);
  });
});
