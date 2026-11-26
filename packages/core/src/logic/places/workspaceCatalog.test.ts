import { describe, expect, it } from 'vitest';
import { CapacitySchema } from '../schemas/capacity.schema';
import {
  capacityNamed,
  isOnWorkspaceFloor,
  WORKSPACE_FEATURES,
  WORKSPACE_FLOORS,
  workspaceFloor,
} from './workspaceCatalog';

describe('Workspace catalog', () => {
  it('gives every capacity its own floor of known features', () => {
    for (const capacity of CapacitySchema.options) {
      const floor = WORKSPACE_FLOORS[capacity];
      expect(floor.length, capacity).toBeGreaterThan(0);
      for (const feature of floor)
        expect(WORKSPACE_FEATURES[feature], `${capacity}: ${feature}`).toBeDefined();
      expect(new Set(floor).size, `${capacity} lists a feature twice`).toBe(floor.length);
    }
  });

  it('keeps each role to its own tools', () => {
    expect(isOnWorkspaceFloor('teacher', 'principal')).toBe(false);
    expect(isOnWorkspaceFloor('teacher', 'tuition')).toBe(false);
    expect(isOnWorkspaceFloor('principal', 'principal')).toBe(true);
    expect(isOnWorkspaceFloor('guardian', 'kiosk')).toBe(false);
    expect(isOnWorkspaceFloor('student', 'founder_command')).toBe(false);
    expect(isOnWorkspaceFloor('founder', 'founder_command')).toBe(true);
  });

  it('reads account names and capitalised preview names alike', () => {
    expect(capacityNamed('assistantPrincipal')).toBe('assistantPrincipal');
    expect(capacityNamed('ASSISTANTPRINCIPAL')).toBe('assistantPrincipal');
    expect(workspaceFloor('TEACHER')).toEqual(WORKSPACE_FLOORS.teacher);
  });

  it('offers nothing to a capacity it does not know', () => {
    expect(workspaceFloor('visitor')).toEqual([]);
  });
});
