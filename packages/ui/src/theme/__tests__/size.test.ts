import { describe, expect, it } from 'vitest';
import { shellLayoutOf, sizeClassOf } from '../size';

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
