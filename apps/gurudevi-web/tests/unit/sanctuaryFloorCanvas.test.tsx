import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { WorkspaceAppearance } from '@repo/core/types';
import { SanctuaryFloorCanvas } from '../../app/(sanctuary)/components/SanctuaryFloorCanvas';
import type { FurnitureDefinition } from '../../app/(sanctuary)/components/FloorStudioDrawer';

const MOCK_FURNITURE: readonly FurnitureDefinition[] = [
  { id: 'workbench', label: 'Task Workbench', icon: '🧭' },
  { id: 'content', label: 'Practices & Canvas', icon: '🪷' },
];

function TestCanvasWrapper() {
  const [appearance, setAppearance] = useState<WorkspaceAppearance>({
    preset: 'dawn',
    motion: 'subtle',
  });
  const [groupOrder, setGroupOrder] = useState<string[]>(['workbench', 'content']);
  const [pinnedIds, setPinnedIds] = useState<string[]>(['workbench']);

  return (
    <SanctuaryFloorCanvas
      domain="test-floor"
      titleId="test-title"
      appearance={appearance}
      setAppearance={setAppearance}
      furnitureItems={MOCK_FURNITURE}
      groupOrder={groupOrder}
      pinnedIds={pinnedIds}
      onReorderFurniture={setGroupOrder}
      onTogglePinFurniture={(id) => {
        setPinnedIds((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
      }}
      topControls={<div data-testid="custom-top-controls">Top Controls Here</div>}
    >
      <h1 id="test-title">Test Floor Content</h1>
      <p>Inner room content</p>
    </SanctuaryFloorCanvas>
  );
}

describe('SanctuaryFloorCanvas and FloorStudioDrawer (G1)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders floor content, top controls, and Floor Studio trigger button', () => {
    render(<TestCanvasWrapper />);

    expect(screen.getByText('Test Floor Content')).toBeDefined();
    expect(screen.getByTestId('custom-top-controls')).toBeDefined();

    const studioTrigger = screen.getByRole('button', { name: /open test-floor floor studio/i });
    expect(studioTrigger).toBeDefined();
    expect(studioTrigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens FloorStudioDrawer on click and switches between Atmosphere and Furniture tabs', () => {
    render(<TestCanvasWrapper />);

    const studioTrigger = screen.getByRole('button', { name: /open test-floor floor studio/i });
    fireEvent.click(studioTrigger);

    // Drawer is now open
    expect(studioTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('dialog', { name: /floor studio/i })).toBeDefined();

    // Tab buttons exist
    const atmosphereTab = screen.getByRole('tab', { name: /atmosphere/i });
    const furnitureTab = screen.getByRole('tab', { name: /furniture/i });
    expect(atmosphereTab).toBeDefined();
    expect(furnitureTab).toBeDefined();

    // Click Furniture tab
    fireEvent.click(furnitureTab);
    expect(screen.getByText('Task Workbench')).toBeDefined();
    expect(screen.getByText('Practices & Canvas')).toBeDefined();

    // Toggle Pin on an item
    const pinButtons = screen.getAllByTitle(/unpin furniture|pin to top/i);
    expect(pinButtons.length).toBeGreaterThan(0);

    // Close drawer
    const closeBtn = screen.getByRole('button', { name: /close floor studio/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: /floor studio/i })).toBeNull();
  });
});
