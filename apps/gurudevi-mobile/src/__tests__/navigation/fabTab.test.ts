import { describe, expect, it } from 'vitest';
import { getCurrentFabTab } from '@/lib/navigation/fabTab';

describe('the tab whose action may show', () => {
  it("admits each room's action at its home route", () => {
    expect(getCurrentFabTab('/community')).toBe('community');
    expect(getCurrentFabTab('/(tabs)/community')).toBe('community');
    expect(getCurrentFabTab('/workspace')).toBe('classroom');
    expect(getCurrentFabTab('/library')).toBe('library');
    expect(getCurrentFabTab('/profile')).toBe('profile');
    expect(getCurrentFabTab('/self')).toBe('self');
  });

  it('keeps retired-domain routes out of the action surface', () => {
    expect(getCurrentFabTab('/workspace/classroom/abc')).toBeNull();
    expect(getCurrentFabTab('/workspace/classroom/abc/students')).toBeNull();
    expect(getCurrentFabTab('/community/post/1')).toBeNull();
  });

  it('shows nowhere outside the tabs', () => {
    expect(getCurrentFabTab('/')).toBeNull();
    expect(getCurrentFabTab('/verger-lab')).toBeNull();
  });
});
