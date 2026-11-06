import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLongPressDnd } from '../../lib/canvas/useLongPressDnd';

describe('useLongPressDnd Headless Engine (G1)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with inactive drag state', () => {
    const onReorder = vi.fn();
    const items = ['alpha', 'beta', 'gamma'];

    const { result } = renderHook(() => useLongPressDnd({ items, onReorder }));

    expect(result.current.isDragging).toBe(false);
    expect(result.current.activeId).toBe(null);
    expect(result.current.overId).toBe(null);
  });

  it('triggers drag state after holdDelayMs', () => {
    const onReorder = vi.fn();
    const items = ['alpha', 'beta', 'gamma'];

    const { result } = renderHook(() =>
      useLongPressDnd({ items, onReorder, holdDelayMs: 400 }),
    );

    const props = result.current.getDragItemProps('alpha', 0);

    // Simulate pointerdown
    act(() => {
      props.onPointerDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        pointerType: 'mouse',
        target: document.createElement('div'),
      } as unknown as React.PointerEvent<HTMLElement>);
    });

    // Before 400ms, not dragging
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.isDragging).toBe(false);

    // After 400ms, active drag triggers
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.isDragging).toBe(true);
    expect(result.current.activeId).toBe('alpha');
  });

  it('cancels hold timer when pointer moves beyond tolerance before delay', () => {
    const onReorder = vi.fn();
    const items = ['alpha', 'beta', 'gamma'];

    const { result } = renderHook(() =>
      useLongPressDnd({ items, onReorder, holdDelayMs: 400, movementTolerancePx: 6 }),
    );

    const props = result.current.getDragItemProps('alpha', 0);

    act(() => {
      props.onPointerDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        pointerType: 'touch',
        target: document.createElement('div'),
      } as unknown as React.PointerEvent<HTMLElement>);
    });

    // Move 15px (e.g. scroll gesture)
    act(() => {
      window.dispatchEvent(
        new MouseEvent('pointermove', {
          clientX: 115,
          clientY: 100,
        }),
      );
    });

    // Advance full delay
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Should NOT be dragging
    expect(result.current.isDragging).toBe(false);
    expect(result.current.activeId).toBe(null);
  });

  it('ignores clicks originating inside buttons and links', () => {
    const onReorder = vi.fn();
    const items = ['alpha', 'beta', 'gamma'];

    const { result } = renderHook(() => useLongPressDnd({ items, onReorder }));
    const props = result.current.getDragItemProps('alpha', 0);

    const buttonEl = document.createElement('button');

    act(() => {
      props.onPointerDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        pointerType: 'mouse',
        target: buttonEl,
      } as unknown as React.PointerEvent<HTMLElement>);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isDragging).toBe(false);
  });

  it('reorders item with Alt+Arrow keys', () => {
    const onReorder = vi.fn();
    const items = ['alpha', 'beta', 'gamma'];

    const { result } = renderHook(() => useLongPressDnd({ items, onReorder }));
    const props = result.current.getDragItemProps('alpha', 0);

    act(() => {
      props.onKeyDown?.({
        altKey: true,
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });

    expect(onReorder).toHaveBeenCalledWith('alpha', 1);
  });
});

