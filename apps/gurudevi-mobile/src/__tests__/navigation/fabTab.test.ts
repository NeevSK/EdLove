import { describe, expect, it } from 'vitest';
import { getCurrentFabTab } from '@/lib/navigation/fabTab';

describe('the tab whose action may show', () => {
  it('only admits the self domain action at its home route', () => {
    expect(getCurrentFabTab('/community')).toBeNull();
    expect(getCurrentFabTab('/(tabs)/community')).toBeNull();
    expect(getCurrentFabTab('/workspace')).toBeNull();
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
