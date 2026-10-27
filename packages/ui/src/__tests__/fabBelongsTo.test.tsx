import { describe, expect, it } from 'vitest';
import { fabBelongsTo } from '../components/LotusPetalFAB';

describe('FAB belongs to the tab on screen', () => {
  it('matches the same kind, and workspace kinds under Workspace', () => {
    expect(fabBelongsTo('community', 'community')).toBe(true);
    expect(fabBelongsTo('classroom', 'principal')).toBe(true);
    expect(fabBelongsTo('classroom', 'founder')).toBe(true);
    expect(fabBelongsTo('community', 'profile')).toBe(true);
    expect(fabBelongsTo('library', 'community')).toBe(false);
    expect(fabBelongsTo('self', 'classroom')).toBe(false);
  });
});
