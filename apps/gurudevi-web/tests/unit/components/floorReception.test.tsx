import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FloorReception } from '../../../app/(sanctuary)/components/FloorReception';

describe('FloorReception Component', () => {
  it('renders Left Anchor with greeting and breadcrumb, and Right Anchor with Studio trigger', () => {
    const onOpenStudio = vi.fn();

    render(
      <FloorReception
        greeting="Good afternoon, Guest Explorer"
        domain="self"
        breadcrumb="Self · Overview"
        onOpenStudio={onOpenStudio}
      />,
    );

    expect(screen.getByText('Good afternoon, Guest Explorer')).toBeDefined();
    expect(screen.getByText('Self · Overview')).toBeDefined();

    const studioBtn = screen.getByRole('button', { name: /Open self Floor Studio/i });
    expect(studioBtn).toBeDefined();

    fireEvent.click(studioBtn);
    expect(onOpenStudio).toHaveBeenCalledWith('atmosphere');
  });

  it('renders arrange mode action when isArrangeMode is true', () => {
    const onToggleArrange = vi.fn();

    render(
      <FloorReception
        domain="workspace"
        isArrangeMode={true}
        onToggleArrange={onToggleArrange}
      />,
    );

    const doneBtn = screen.getByRole('button', { name: /Exit floor arranging mode/i });
    expect(doneBtn).toBeDefined();

    fireEvent.click(doneBtn);
    expect(onToggleArrange).toHaveBeenCalled();
  });

  it('renders custom extra actions and temporal instruments in Right Island', () => {
    render(
      <FloorReception
        domain="self"
        timeControl={<span data-testid="test-clock">15:23</span>}
        renderExtra={() => <button type="button">🌿 Center Now</button>}
      />,
    );

    expect(screen.getByTestId('test-clock')).toBeDefined();
    expect(screen.getByRole('button', { name: /Center Now/i })).toBeDefined();
  });
});
