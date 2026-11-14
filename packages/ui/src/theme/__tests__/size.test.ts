import { describe, expect, it } from 'vitest';
import { aspectClassOf, shellLayoutOf, sizeClassOf } from '../size';

describe('size classes', () => {
  it('names small phones, phones, small tablets and tablets', () => {
    expect(sizeClassOf(320)).toBe('compact');
    expect(sizeClassOf(360)).toBe('regular');
    expect(sizeClassOf(412)).toBe('regular');
    expect(sizeClassOf(700)).toBe('medium');
    expect(sizeClassOf(1024)).toBe('expanded');
  });

  it('docks the rooms on small phones, floats them on phones, and rails them on tablets', () => {
    expect(shellLayoutOf(320).tabs).toBe('docked');
    expect(shellLayoutOf(412).tabs).toBe('floating');
    expect(shellLayoutOf(800).tabs).toBe('rail');
    expect(shellLayoutOf(1280, 'docked').tabs).toBe('rail');
  });

  it("keeps the person's choice on a phone", () => {
    expect(shellLayoutOf(412, 'docked').tabs).toBe('docked');
    expect(shellLayoutOf(320, 'floating').tabs).toBe('floating');
  });
});

describe('posture, aspect and stance', () => {
  it('reads tall phones, classic phones and square tablets', () => {
    expect(aspectClassOf(393, 873)).toBe('tall'); // 20:9
    expect(aspectClassOf(360, 640)).toBe('classic'); // 16:9
    expect(aspectClassOf(820, 1180)).toBe('square'); // tablet
    expect(aspectClassOf(873, 393)).toBe('tall'); // the same phone on its side
  });

  it('holds a phone on its side like a game: rail, no header row', () => {
    const a24 = shellLayoutOf(873, 'auto', 393);
    expect(a24.posture).toBe('landscape');
    expect(a24.stance).toBe('hud');
    expect(a24.tabs).toBe('rail');
    expect(a24.header).toBe(false);
    // A small, old phone on its side is still a hud, even though it is not wide.
    expect(shellLayoutOf(568, 'auto', 320).stance).toBe('hud');
    expect(shellLayoutOf(568, 'docked', 320).tabs).toBe('rail');
  });

  it('gives a tablet on its side a header and a rail', () => {
    const tab = shellLayoutOf(1180, 'auto', 820);
    expect(tab.stance).toBe('wide');
    expect(tab.header).toBe(true);
    expect(tab.columns).toBe(3);
  });

  it('keeps a phone upright as before', () => {
    const a52 = shellLayoutOf(412, 'auto', 915);
    expect(a52.stance).toBe('upright');
    expect(a52.tabs).toBe('floating');
    expect(a52.columns).toBe(1);
  });

  it('counts columns beside the rail', () => {
    expect(shellLayoutOf(873, 'auto', 393).columns).toBe(2);
    expect(shellLayoutOf(640, 'auto', 360).columns).toBe(1);
  });
});

describe('small windows', () => {
  it('a split-screen half or a cover screen is tight, with small edges', () => {
    const cover = shellLayoutOf(280, 'auto', 650);
    expect(cover.tight).toBe(true);
    expect(cover.gutter).toBe(10);
    expect(shellLayoutOf(411, 'auto', 540).tight).toBe(true);
  });
  it('an ordinary phone, a tablet and a sideways phone are not', () => {
    expect(shellLayoutOf(411, 'auto', 891).tight).toBe(false);
    expect(shellLayoutOf(800, 'auto', 1280).tight).toBe(false);
    expect(shellLayoutOf(891, 'auto', 411).tight).toBe(false);
  });
});
