import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_EXPLORE_CAPACITY,
  EXPLORE_CAPACITIES,
  EXPLORE_CAPACITY_EVENT,
  EXPLORE_CAPACITY_STORAGE_KEY,
  getExploreCapacity,
  getExploreCapacityMeta,
  isExploreCapacity,
  setExploreCapacity,
} from './exploreCapacity';

describe('explore capacity state management (G1 boundary)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('defaults to teacher when no capacity has been selected', () => {
    expect(getExploreCapacity()).toBe(DEFAULT_EXPLORE_CAPACITY);
    expect(getExploreCapacity()).toBe('teacher');
  });

  it('validates canonical capacities correctly', () => {
    expect(isExploreCapacity('teacher')).toBe(true);
    expect(isExploreCapacity('principal')).toBe(true);
    expect(isExploreCapacity('student')).toBe(true);
    expect(isExploreCapacity('guardian')).toBe(true);
    expect(isExploreCapacity('TEACHER')).toBe(true);
    expect(isExploreCapacity('astronaut')).toBe(false);
    expect(isExploreCapacity(null)).toBe(false);
    expect(isExploreCapacity(undefined)).toBe(false);
  });

  it('persists selected capacity and dispatches a broadcast event', () => {
    let capturedEvent: CustomEvent<{ capacity: string }> | null = null;
    const listener = (event: Event) => {
      capturedEvent = event as CustomEvent<{ capacity: string }>;
    };
    window.addEventListener(EXPLORE_CAPACITY_EVENT, listener);

    setExploreCapacity('principal');

    expect(window.localStorage.getItem(EXPLORE_CAPACITY_STORAGE_KEY)).toBe('principal');
    expect(getExploreCapacity()).toBe('principal');
    const event = capturedEvent as CustomEvent<{ capacity: string }> | null;
    expect(event?.detail.capacity).toBe('principal');

    window.removeEventListener(EXPLORE_CAPACITY_EVENT, listener);
  });

  it('falls back to teacher when invalid data is stored in localStorage', () => {
    window.localStorage.setItem(EXPLORE_CAPACITY_STORAGE_KEY, 'corrupted_value');
    expect(getExploreCapacity()).toBe('teacher');
  });

  it('retrieves capacity metadata for every canonical role', () => {
    for (const capacity of EXPLORE_CAPACITIES) {
      const meta = getExploreCapacityMeta(capacity.id);
      expect(meta.id).toBe(capacity.id);
      expect(meta.label).toBeTruthy();
      expect(meta.roleTitle).toBeTruthy();
      expect(meta.domainOverview.workspace).toBeTruthy();
      expect(meta.domainOverview.self).toBeTruthy();
    }
  });
});
