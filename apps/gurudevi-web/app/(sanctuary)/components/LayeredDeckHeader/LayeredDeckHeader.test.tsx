import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LayeredDeckHeader } from './LayeredDeckHeader';

describe('LayeredDeckHeader Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders all four slots when provided', () => {
    render(
      <LayeredDeckHeader
        headerSlot={<div data-testid="slot-1">Header</div>}
        bannerSlot={<div data-testid="slot-2">Banner</div>}
        navSlot={<div data-testid="slot-3">Primary Nav</div>}
        taskStripSlot={<div data-testid="slot-4">Task Strip</div>}
      />,
    );

    expect(screen.getByTestId('slot-1')).toBeDefined();
    expect(screen.getByTestId('slot-2')).toBeDefined();
    expect(screen.getByTestId('slot-3')).toBeDefined();
    expect(screen.getByTestId('slot-4')).toBeDefined();
  });

  it('starts in expanded state (data-collapsed="false")', () => {
    const { container } = render(
      <LayeredDeckHeader headerSlot={<div>Header</div>} navSlot={<div>Primary Nav</div>} />,
    );

    const root = container.querySelector('[aria-label="Deck navigation"]');
    expect(root?.getAttribute('data-collapsed')).toBe('false');
  });

  it('remains completely stationary on hover to satisfy Fitts Law (zero moving target anti-pattern)', () => {
    const { container } = render(
      <LayeredDeckHeader headerSlot={<div>Header</div>} navSlot={<div>Primary Nav</div>} />,
    );

    const root = container.querySelector('[aria-label="Deck navigation"]') as HTMLElement;

    // Hover enters
    fireEvent.mouseEnter(root);
    expect(root.getAttribute('data-collapsed')).toBe('false');

    // Hover leaves
    fireEvent.mouseLeave(root);
    expect(root.getAttribute('data-collapsed')).toBe('false');
  });

  it('forces expansion on keyboard focus-within for accessibility', () => {
    const { container } = render(
      <LayeredDeckHeader headerSlot={<button>Action</button>} navSlot={<a href="/self">Self</a>} />,
    );

    const root = container.querySelector('[aria-label="Deck navigation"]') as HTMLElement;

    fireEvent.focus(root);
    expect(root.getAttribute('data-collapsed')).toBe('false');

    fireEvent.blur(root, { relatedTarget: document.body });
    expect(root.getAttribute('data-collapsed')).toBe('false');
  });

  it('remains stable at the bottom of the scroll container without dancing or flip-flopping', () => {
    const { container } = render(
      <LayeredDeckHeader
        headerSlot={<div>Header</div>}
        navSlot={<div>Primary Nav</div>}
        scrollThreshold={48}
      />,
    );

    const root = container.querySelector('[aria-label="Deck navigation"]') as HTMLElement;

    // Simulate mock viewport at bottom: scrollHeight=1000, clientHeight=600, maxScroll=400, scrollTop=395
    const mockViewport = document.createElement('div');
    mockViewport.className = 'gd-scrollarea-viewport';
    Object.defineProperty(mockViewport, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(mockViewport, 'clientHeight', { value: 600, configurable: true });
    Object.defineProperty(mockViewport, 'scrollTop', { value: 395, configurable: true });
    document.body.appendChild(mockViewport);

    act(() => {
      mockViewport.dispatchEvent(new Event('scroll', { bubbles: true }));
      vi.advanceTimersByTime(20);
    });

    // Should be cleanly collapsed and stable at bottom
    expect(root.getAttribute('data-collapsed')).toBe('true');

    // Simulate elastic bounce-back at bottom (e.g. scrollTop drops from 400 down to 385 due to bounce/clamp)
    Object.defineProperty(mockViewport, 'scrollTop', { value: 385, configurable: true });
    act(() => {
      mockViewport.dispatchEvent(new Event('scroll', { bubbles: true }));
      vi.advanceTimersByTime(20);
    });

    // Still stable at bottom! Bottom boundary protection prevents flip-flop
    expect(root.getAttribute('data-collapsed')).toBe('true');

    document.body.removeChild(mockViewport);
  });

  it('never collapses on shallow or non-scrollable screens where maxScroll < minScrollRequired', () => {
    const { container } = render(
      <LayeredDeckHeader
        headerSlot={<div style={{ height: 50 }}>Header</div>}
        navSlot={<div style={{ height: 40 }}>Primary Nav</div>}
        scrollThreshold={48}
      />,
    );

    const root = container.querySelector('[aria-label="Deck navigation"]') as HTMLElement;

    // Simulate shallow screen: scrollHeight=650, clientHeight=600, maxScroll=50 (less than minScrollRequired)
    const mockViewport = document.createElement('div');
    mockViewport.id = 'sanctuary-main';
    Object.defineProperty(mockViewport, 'scrollHeight', { value: 650, configurable: true });
    Object.defineProperty(mockViewport, 'clientHeight', { value: 600, configurable: true });
    Object.defineProperty(mockViewport, 'scrollTop', { value: 50, configurable: true });
    document.body.appendChild(mockViewport);

    act(() => {
      mockViewport.dispatchEvent(new Event('scroll', { bubbles: true }));
      vi.advanceTimersByTime(20);
    });

    // Header must remain safely expanded (data-collapsed="false") because the page lacks scroll runway!
    expect(root.getAttribute('data-collapsed')).toBe('false');

    document.body.removeChild(mockViewport);
  });
});
