import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorkspaceAppearance } from '@repo/core/types';
import { SanctuaryFloorCanvas } from '../../app/(sanctuary)/components/SanctuaryFloorCanvas';
import type { FurnitureDefinition } from '../../app/(sanctuary)/components/FloorStudioDrawer';
import { worldThemeStore } from '../../lib/theme/useWorldTheme';

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

  it('switches ground mode between Live Sky and Photo in FloorStudioDrawer', () => {
    render(<TestCanvasWrapper />);

    const studioTrigger = screen.getByRole('button', { name: /open test-floor floor studio/i });
    fireEvent.click(studioTrigger);

    // Click Live Sky
    const liveSkyBtn = screen.getByRole('button', { name: /live sky/i });
    fireEvent.click(liveSkyBtn);

    const floorArticle = document.querySelector('article[data-domain="test-floor"]');
    expect(floorArticle?.getAttribute('data-ground-mode')).toBe('live');
    expect(floorArticle?.getAttribute('data-has-wallpaper')).toBe('false');

    // Click Photo
    const photoBtn = screen.getByRole('button', { name: /photo/i });
    fireEvent.click(photoBtn);

    expect(floorArticle?.getAttribute('data-ground-mode')).toBe('image');
    expect(floorArticle?.getAttribute('data-has-wallpaper')).toBe('true');
  });

  it('allows reordering furniture via keyboard shortcuts in FloorStudioDrawer', () => {
    render(<TestCanvasWrapper />);

    const studioTrigger = screen.getByRole('button', { name: /open test-floor floor studio/i });
    fireEvent.click(studioTrigger);

    const furnitureTab = screen.getByRole('tab', { name: /furniture/i });
    fireEvent.click(furnitureTab);

    const workbenchItem = document.querySelector('[data-dnd-id="workbench"]');
    expect(workbenchItem).toBeDefined();

    // Trigger Alt+ArrowDown
    fireEvent.keyDown(workbenchItem!, { key: 'ArrowDown', altKey: true });

    // Item order should have flipped
    const items = Array.from(document.querySelectorAll('[data-dnd-id]')).map((el) =>
      el.getAttribute('data-dnd-id'),
    );
    expect(items).toEqual(['content', 'workbench']);
  });

  it('renders and toggles the Arrange Floor button via Floor Studio', () => {
    render(<TestCanvasWrapper />);

    // Open Floor Studio drawer and switch to furniture tab
    const studioTrigger = screen.getByRole('button', { name: /open test-floor floor studio/i });
    fireEvent.click(studioTrigger);

    const furnitureTab = screen.getByRole('tab', { name: /furniture/i });
    fireEvent.click(furnitureTab);

    const arrangeBtn = screen.getByRole('button', { name: /arrange floor sections/i });
    expect(arrangeBtn).toBeDefined();
    expect(arrangeBtn.getAttribute('aria-pressed')).toBe('false');

    // Click to enter arrange mode
    fireEvent.click(arrangeBtn);
    expect(arrangeBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Done Arranging')).toBeDefined();

    // Click exit arrange mode button in reception
    const doneBtn = screen.getByText('Done Arranging');
    fireEvent.click(doneBtn);
    expect(screen.queryByText('Done Arranging')).toBeNull();
  });

  it('dynamically reacts to global useWorldTheme changes when appearance does not fix a worldId', () => {
    worldThemeStore.setWorld('sanctuary');
    const { rerender } = render(<SanctuaryFloorCanvas domain="test-floor" titleId="test-title"><div>Test</div></SanctuaryFloorCanvas>);
    const floorArticle = document.querySelector('article[data-domain="test-floor"]');
    expect(floorArticle?.getAttribute('data-world')).toBe('sanctuary');

    // Switch world via worldThemeStore
    worldThemeStore.setWorld('kele');
    rerender(<SanctuaryFloorCanvas domain="test-floor" titleId="test-title"><div>Test</div></SanctuaryFloorCanvas>);
    expect(floorArticle?.getAttribute('data-world')).toBe('kele');
  });

  it('ensures all sanctuary floors inherit universal world changes downstream in real time', () => {
    worldThemeStore.setWorld('sanctuary');

    // Mount two distinct sanctuary floors (e.g. Self and Workspace)
    const { rerender } = render(
      <div>
        <SanctuaryFloorCanvas domain="self" titleId="self-title">
          <div>Self Floor Content</div>
        </SanctuaryFloorCanvas>
        <SanctuaryFloorCanvas domain="workspace" titleId="workspace-title">
          <div>Workspace Floor Content</div>
        </SanctuaryFloorCanvas>
      </div>,
    );

    const selfArticle = document.querySelector('article[data-domain="self"]');
    const workspaceArticle = document.querySelector('article[data-domain="workspace"]');

    expect(selfArticle?.getAttribute('data-world')).toBe('sanctuary');
    expect(workspaceArticle?.getAttribute('data-world')).toBe('sanctuary');

    // Switch sanctuary world to "tea" (Ceylon Tea Hills)
    worldThemeStore.setWorld('tea');

    rerender(
      <div>
        <SanctuaryFloorCanvas domain="self" titleId="self-title">
          <div>Self Floor Content</div>
        </SanctuaryFloorCanvas>
        <SanctuaryFloorCanvas domain="workspace" titleId="workspace-title">
          <div>Workspace Floor Content</div>
        </SanctuaryFloorCanvas>
      </div>,
    );

    // Both floors must inherit the new world downstream without stale shadows
    expect(selfArticle?.getAttribute('data-world')).toBe('tea');
    expect(workspaceArticle?.getAttribute('data-world')).toBe('tea');
  });
});
