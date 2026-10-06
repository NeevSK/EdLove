import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useSelfCanvas, DEFAULT_SELF_CATEGORIES } from '../../lib/canvas/useSelfCanvas';

describe('useSelfCanvas Headless Arrangement Engine (G1)', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  afterEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('initializes with default categories and pinned features', () => {
    const { result } = renderHook(() => useSelfCanvas({ accountId: 'test-user' }));

    expect(result.current.viewport).toBe('desktop');
    expect(result.current.layoutMode).toBe('overview');
    expect(result.current.groupOrder).toEqual(DEFAULT_SELF_CATEGORIES);
    expect(result.current.pinnedIds).toContain('fire_journal');
    expect(result.current.pinnedFeatures.some((f) => f.id === 'fire_journal')).toBe(true);
  });

  it('resolves master-detail layout mode on tablet/desktop when an active feature is set', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800 });
    const { result } = renderHook(() =>
      useSelfCanvas({ accountId: 'test-user', activeFeatureId: 'fire_journal' }),
    );

    expect(result.current.viewport).toBe('tablet');
    expect(result.current.layoutMode).toBe('master-detail');
  });

  it('resolves stream layout mode on mobile when an active feature is set', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400 });
    const { result } = renderHook(() =>
      useSelfCanvas({ accountId: 'test-user', activeFeatureId: 'fire_journal' }),
    );

    expect(result.current.viewport).toBe('mobile');
    expect(result.current.layoutMode).toBe('stream');
  });

  it('handles dynamic pinning respecting the pin cap of 2', () => {
    const { result } = renderHook(() => useSelfCanvas({ accountId: 'test-user' }));

    expect(result.current.pinnedIds).toEqual(['fire_journal']);

    // Pin a second practice
    act(() => {
      result.current.togglePin('mood_lotus');
    });
    expect(result.current.pinnedIds).toEqual(['fire_journal', 'mood_lotus']);

    // Pin a third practice — should rotate out the oldest to respect cap of 2
    act(() => {
      result.current.togglePin('gratitude_glimmers');
    });
    expect(result.current.pinnedIds.length).toBe(2);
    expect(result.current.pinnedIds).toEqual(['mood_lotus', 'gratitude_glimmers']);

    // Unpinning an item
    act(() => {
      result.current.togglePin('mood_lotus');
    });
    expect(result.current.pinnedIds).toEqual(['gratitude_glimmers']);

    // Unpinning the last item restores default fire_journal
    act(() => {
      result.current.togglePin('gratitude_glimmers');
    });
    expect(result.current.pinnedIds).toEqual(['fire_journal']);
  });

  it('groups features into manifest categories', () => {
    const { result } = renderHook(() => useSelfCanvas({ accountId: 'test-user' }));

    const categories = result.current.featuresByCategory;
    expect(categories.has('practice')).toBe(true);
    expect(categories.has('wellbeing')).toBe(true);
    const practiceFeatures = categories.get('practice');
    expect(practiceFeatures?.some((f) => f.id === 'fire_journal')).toBe(true);
  });
});
