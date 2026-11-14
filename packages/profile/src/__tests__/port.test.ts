import { describe, expect, it } from 'vitest';
import { profilePort } from '../port';

describe('profile port', () => {
  it('picks a sample story by capacity and falls back for unknown ones', async () => {
    const p = profilePort.get();
    const principal = await p.story('principal');
    expect(principal.sample).toBe(true);
    expect(principal.title).toMatch(/Principal/);
    const other = await p.story('platform_staff');
    expect(other.bio.length).toBeGreaterThan(0);
  });
});
