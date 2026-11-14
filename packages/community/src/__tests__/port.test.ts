import { describe, expect, it } from 'vitest';
import { communityPort } from '../port';

describe('community port', () => {
  it('gives the square from samples, pinned notices first', async () => {
    const sq = await communityPort.get().square();
    expect(sq.posts.length).toBeGreaterThan(0);
    expect(sq.groups.length).toBeGreaterThan(0);
    const firstUnpinned = sq.notices.findIndex((n) => !n.pinned);
    if (firstUnpinned >= 0)
      expect(sq.notices.slice(firstUnpinned).every((n) => !n.pinned)).toBe(true);
  });

  it('stops when asked', async () => {
    const ctl = new AbortController();
    ctl.abort();
    await expect(communityPort.get().square(ctl.signal)).rejects.toBeTruthy();
  });
});
