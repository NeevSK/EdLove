import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface PanCallbacks {
  enabled?: boolean;
  activateAfterLongPress?: number;
  onActivate?: () => void;
  onUpdate?: (event: { translationX: number; translationY: number }) => void;
  onDeactivate?: (event: { canceled: boolean }) => void;
  onFinalize?: () => void;
}

const captured = vi.hoisted(() => ({
  pan: null as PanCallbacks | null,
  style: null as (() => { transform: readonly object[] }) | null,
  haptic: vi.fn(),
}));

vi.mock('react-native-gesture-handler', () => ({
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  usePanGesture: (config: PanCallbacks) => {
    captured.pan = config;
    return config;
  },
}));
vi.mock('@repo/ui/utils/haptics', () => ({ hapticMedium: captured.haptic }));
vi.mock('@repo/ui/components/ui/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@repo/ui/components/ui/overlay', () => ({ Overlay: () => null }));
vi.mock('react-native-worklets', () => ({
  scheduleOnRN: (callback: (...args: unknown[]) => void, ...args: unknown[]) => callback(...args),
}));
vi.mock('react-native-reanimated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-native-reanimated')>();
  return {
    ...actual,
    useSharedValue: (initial: number | boolean) => {
      const shared = {
        value: initial,
        get: () => shared.value,
        set: (next: number | boolean) => {
          shared.value = next;
        },
      };
      return shared;
    },
    useAnimatedStyle: (style: () => { transform: readonly object[] }) => {
      captured.style = style;
      return style();
    },
    withSpring: (value: number) => value,
    withTiming: (value: number) => value,
  };
});

import { Actionsheet, ActionsheetContent } from '../ui/actionsheet';
import { DraggableCanvasSurface } from '../workspace/DraggableCanvasSurface';

function pan() {
  if (!captured.pan) throw new Error('Pan was not mounted');
  return captured.pan;
}

describe('workspace drag lifecycle / substituted gesture and animation engines', () => {
  beforeEach(() => {
    captured.pan = null;
    captured.style = null;
    captured.haptic.mockClear();
  });

  it('waits for native hold activation and does not start a drag on an ordinary mount', async () => {
    const start = vi.fn();
    await render(
      <DraggableCanvasSurface id="card" onDragStart={start}>
        <Text>Child</Text>
      </DraggableCanvasSurface>,
    );
    expect(pan().activateAfterLongPress).toBe(260);
    expect(start).not.toHaveBeenCalled();
    pan().onActivate?.();
    expect(start).toHaveBeenCalledOnce();
    expect(captured.haptic).toHaveBeenCalledOnce();
  });

  it('persists a successful constrained drag and resets after finalization', async () => {
    const end = vi.fn();
    await render(
      <DraggableCanvasSurface id="card" dragAxis="vertical" onDragEnd={end}>
        <Text>Child</Text>
      </DraggableCanvasSurface>,
    );
    pan().onActivate?.();
    pan().onUpdate?.({ translationX: 40, translationY: 90 });
    pan().onDeactivate?.({ canceled: false });
    expect(end).toHaveBeenCalledWith('card', { x: 0, y: 90 });
    pan().onFinalize?.();
    expect(captured.style?.().transform).toEqual([
      { translateX: 0 },
      { translateY: 0 },
      { scale: 1 },
    ]);
  });

  it('cancellation restores the visuals and never persists a drag', async () => {
    const end = vi.fn();
    await render(
      <DraggableCanvasSurface id="card" onDragEnd={end}>
        <Text>Child</Text>
      </DraggableCanvasSurface>,
    );
    pan().onActivate?.();
    pan().onUpdate?.({ translationX: 40, translationY: 90 });
    pan().onDeactivate?.({ canceled: true });
    pan().onFinalize?.();
    expect(end).not.toHaveBeenCalled();
    expect(captured.style?.().transform).toEqual([
      { translateX: 0 },
      { translateY: 0 },
      { scale: 1 },
    ]);
  });

  it('leaves children available while dragging is disabled', async () => {
    const view = await render(
      <DraggableCanvasSurface id="card" enabled={false}>
        <Text>Child</Text>
      </DraggableCanvasSurface>,
    );
    expect(pan().enabled).toBe(false);
    expect(view.getByText('Child')).toBeTruthy();
  });

  it('does not dismiss a sheet when a native gesture cancels past its threshold', async () => {
    const close = vi.fn();
    await render(
      <Actionsheet isOpen onClose={close}>
        <ActionsheetContent />
      </Actionsheet>,
    );
    pan().onUpdate?.({ translationX: 0, translationY: 160 });
    pan().onDeactivate?.({ canceled: true });
    pan().onFinalize?.();
    expect(close).not.toHaveBeenCalled();
    expect(captured.style?.().transform).toEqual([{ translateY: 0 }]);
  });

  it('dismisses a sheet only after a successful gesture crosses its threshold', async () => {
    const close = vi.fn();
    await render(
      <Actionsheet isOpen onClose={close}>
        <ActionsheetContent />
      </Actionsheet>,
    );
    pan().onUpdate?.({ translationX: 0, translationY: 100 });
    pan().onDeactivate?.({ canceled: false });
    expect(close).not.toHaveBeenCalled();
    pan().onUpdate?.({ translationX: 0, translationY: 160 });
    pan().onDeactivate?.({ canceled: false });
    expect(close).toHaveBeenCalledOnce();
    pan().onFinalize?.();
    expect(captured.style?.().transform).toEqual([{ translateY: 0 }]);
  });
});
