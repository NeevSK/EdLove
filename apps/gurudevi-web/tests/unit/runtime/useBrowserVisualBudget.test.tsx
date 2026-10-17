import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useBrowserVisualBudget } from '../../../lib/runtime/useBrowserVisualBudget';

const originalDeviceMemory = Object.getOwnPropertyDescriptor(navigator, 'deviceMemory');
const originalHardwareConcurrency = Object.getOwnPropertyDescriptor(
  navigator,
  'hardwareConcurrency',
);
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

afterEach(() => {
  if (originalDeviceMemory) {
    Object.defineProperty(navigator, 'deviceMemory', originalDeviceMemory);
  } else {
    Reflect.deleteProperty(navigator, 'deviceMemory');
  }
  if (originalHardwareConcurrency) {
    Object.defineProperty(navigator, 'hardwareConcurrency', originalHardwareConcurrency);
  } else {
    Reflect.deleteProperty(navigator, 'hardwareConcurrency');
  }
  if (originalMatchMedia) {
    Object.defineProperty(window, 'matchMedia', originalMatchMedia);
  } else {
    Reflect.deleteProperty(window, 'matchMedia');
  }
});

describe('useBrowserVisualBudget', () => {
  it('starts with decorative work disabled, then resolves the observed device budget', () => {
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 8 });
    const renderedQualities: string[] = [];

    const { result } = renderHook(() => {
      const budget = useBrowserVisualBudget();
      renderedQualities.push(budget.quality);
      return budget;
    });

    expect(renderedQualities[0]).toBe('essential');
    expect(result.current.quality).toBe('rich');
  });

  it('keeps running when reduced-motion media queries are unavailable', () => {
    Reflect.deleteProperty(window, 'matchMedia');

    const { result } = renderHook(() => useBrowserVisualBudget());

    expect(result.current.quality).toBe('balanced');
  });

  it('uses a low-core fallback when the browser hides memory information', () => {
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 4 });

    const { result } = renderHook(() => useBrowserVisualBudget());

    expect(result.current.quality).toBe('essential');
  });
});
