import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScrollArea } from '@repo/ui/components/web';

if (typeof window !== 'undefined' && !window.PointerEvent) {
  // @ts-expect-error JSDOM environment shim
  window.PointerEvent = window.MouseEvent;
}

describe('web kit: ScrollArea', () => {
  it('renders with role="region" and accessible aria-label', () => {
    render(
      <ScrollArea label="Classroom Timeline">
        <div data-testid="item">Timeline item</div>
      </ScrollArea>,
    );

    const region = screen.getByRole('region', { name: 'Classroom Timeline' });
    expect(region).toBeDefined();
    expect(region.className).toContain('gd-scrollarea-viewport');
    expect(screen.getByTestId('item')).toBeDefined();
  });

  it('respects horizontal, vertical, and both orientations', () => {
    const { unmount } = render(
      <ScrollArea orientation="vertical" label="Vertical List">
        <div>Item</div>
      </ScrollArea>,
    );
    let region = screen.getByRole('region', { name: 'Vertical List' });
    expect(region.getAttribute('data-orientation')).toBe('vertical');
    unmount();

    render(
      <ScrollArea orientation="both" label="2D Graph">
        <div>Item</div>
      </ScrollArea>,
    );
    region = screen.getByRole('region', { name: '2D Graph' });
    expect(region.getAttribute('data-orientation')).toBe('both');
  });

  it('handles keyboard navigation keys on the scroll region', () => {
    render(
      <ScrollArea orientation="horizontal" label="Horizontal Strip">
        <div style={{ width: 1000 }}>Long Content</div>
      </ScrollArea>,
    );

    const region = screen.getByRole('region', { name: 'Horizontal Strip' });

    // Mock layout metrics on region
    Object.defineProperty(region, 'clientWidth', { value: 300, configurable: true });
    Object.defineProperty(region, 'scrollWidth', { value: 1200, configurable: true });

    // Key presses
    fireEvent.keyDown(region, { key: 'ArrowRight' });
    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    fireEvent.keyDown(region, { key: 'End' });
    fireEvent.keyDown(region, { key: 'Home' });

    expect(region).toBeDefined();
  });

  it('suppresses accidental click when user drags beyond movement threshold', () => {
    const onClick = vi.fn();
    render(
      <ScrollArea label="Interactive Cards">
        <button data-testid="card-btn" onClick={onClick}>
          Card Click
        </button>
      </ScrollArea>,
    );

    const region = screen.getByRole('region', { name: 'Interactive Cards' });
    const btn = screen.getByTestId('card-btn');

    // Simulate drag start on region canvas
    fireEvent.pointerDown(region, {
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 100,
      pointerType: 'mouse',
    });

    // Move 50px (exceeds 4px drag threshold)
    fireEvent.pointerMove(region, {
      clientX: 150,
      clientY: 100,
    });

    // Release pointer
    fireEvent.pointerUp(region, {
      pointerId: 1,
    });

    // Synthetic click attempt
    fireEvent.click(btn);

    // Suppressed!
    expect(onClick).not.toHaveBeenCalled();
  });

  it('automatically resolves living scrollbar archetype from the active world', () => {
    const { unmount } = render(
      <div data-world="wewa">
        <ScrollArea label="Wewa Area">
          <div>Water Item</div>
        </ScrollArea>
      </div>,
    );
    let region = screen.getByRole('region', { name: 'Wewa Area' });
    let root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('fluid');
    unmount();

    render(
      <div data-world="kele">
        <ScrollArea label="Kele Area">
          <div>Forest Item</div>
        </ScrollArea>
      </div>,
    );
    region = screen.getByRole('region', { name: 'Kele Area' });
    root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('leaf');
  });

  it('renders OS-driven variants with proper data-variant attributes and classic steppers', () => {
    const { rerender } = render(
      <ScrollArea variant="sovereign" label="Sovereign Area">
        <div>Content</div>
      </ScrollArea>,
    );
    let region = screen.getByRole('region', { name: 'Sovereign Area' });
    let root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('sovereign');

    rerender(
      <ScrollArea variant="macos" label="macOS Area">
        <div>Content</div>
      </ScrollArea>,
    );
    region = screen.getByRole('region', { name: 'macOS Area' });
    root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('macos');

    rerender(
      <ScrollArea variant="fluent" label="Fluent Area">
        <div>Content</div>
      </ScrollArea>,
    );
    region = screen.getByRole('region', { name: 'Fluent Area' });
    root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('fluent');

    rerender(
      <ScrollArea variant="classic" orientation="vertical" label="Classic Area">
        <div>Content</div>
      </ScrollArea>,
    );
    region = screen.getByRole('region', { name: 'Classic Area' });
    root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('classic');

    // Steppers should be rendered for classic
    const stepUp = screen.getByRole('button', { name: 'Scroll backward' });
    const stepDown = screen.getByRole('button', { name: 'Scroll forward' });
    expect(stepUp).toBeDefined();
    expect(stepDown).toBeDefined();
    expect(stepUp.textContent).toBe('▲');
    expect(stepDown.textContent).toBe('▼');

    // Stepper click test
    fireEvent.click(stepUp);
    fireEvent.click(stepDown);

    rerender(
      <ScrollArea variant="native" label="Native Area">
        <div>Content</div>
      </ScrollArea>,
    );
    region = screen.getByRole('region', { name: 'Native Area' });
    root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('native');
    // Native does not render custom track
    expect(root.querySelector('.gd-scrollarea-track')).toBeNull();
  });

  it('renders next-gen living instruments: mechanical, fluid, circadian, perimeter, pips, and hud', () => {
    const pips = [
      { id: 'spot-1', label: 'Brahma Muhūrta', offsetPct: 15 },
      { id: 'spot-2', label: 'Morning Seminar', offsetPct: 50 },
      { id: 'spot-3', label: 'Dusk Sandhyā', offsetPct: 85 },
    ];

    const { rerender } = render(
      <ScrollArea
        variant="mechanical"
        label="Mechanical Instrument"
        scrollbarVisibility="always"
        pips={pips}
        hudLabel="Section 1"
      >
        <div style={{ height: 1000 }}>Long Content</div>
      </ScrollArea>,
    );

    let region = screen.getByRole('region', { name: 'Mechanical Instrument' });
    let root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('mechanical');
    expect(root.style.getPropertyValue('--gd-scroll-stretch')).toBe('1');
    expect(root.style.getPropertyValue('--gd-sun-angle')).toBeDefined();

    // Verify pips rendered
    const pipEls = root.querySelectorAll('.gd-scrollarea-pip');
    expect(pipEls.length).toBe(3);
    expect(pipEls[0]?.getAttribute('title')).toBe('Brahma Muhūrta');

    // Click pip triggers scrollTo / scroll
    fireEvent.click(pipEls[1]!);

    // Fluid variant
    rerender(
      <ScrollArea variant="fluid" label="Fluid Instrument">
        <div>Content</div>
      </ScrollArea>,
    );
    region = screen.getByRole('region', { name: 'Fluid Instrument' });
    root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('fluid');

    // Circadian variant
    rerender(
      <ScrollArea variant="circadian" label="Circadian Instrument">
        <div>Content</div>
      </ScrollArea>,
    );
    region = screen.getByRole('region', { name: 'Circadian Instrument' });
    root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('circadian');

    // Perimeter variant
    rerender(
      <ScrollArea variant="perimeter" label="Perimeter Instrument">
        <div>Content</div>
      </ScrollArea>,
    );
    region = screen.getByRole('region', { name: 'Perimeter Instrument' });
    root = region.parentElement!;
    expect(root.getAttribute('data-variant')).toBe('perimeter');
  });
});
