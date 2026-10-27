import { describe, expect, it } from 'vitest';
import { getCurrentFabTab } from '@/lib/navigation/fabTab';

describe('the tab whose action may show', () => {
  it('reads tab homes with or without the group segment', () => {
    expect(getCurrentFabTab('/community')).toBe('community');
    expect(getCurrentFabTab('/(tabs)/community')).toBe('community');
    expect(getCurrentFabTab('/workspace')).toBe('classroom');
    expect(getCurrentFabTab('/self')).toBe('self');
  });

  it("shows on a classroom's dashboard but not deeper screens", () => {
    expect(getCurrentFabTab('/workspace/classroom/abc')).toBe('classroom');
    expect(getCurrentFabTab('/workspace/classroom/abc/students')).toBeNull();
    expect(getCurrentFabTab('/community/post/1')).toBeNull();
  });

  it('shows nowhere outside the tabs', () => {
    expect(getCurrentFabTab('/')).toBeNull();
    expect(getCurrentFabTab('/verger-lab')).toBeNull();
  });
});
