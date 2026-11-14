import { fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { WorldScope } from '../../../theme/native';
import { WORLD_IDS } from '../../../theme/worlds';
import { MoveControl } from '../Move/MoveControl';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));

function wrap(node: React.ReactNode) {
  return (
    <WorldScope world={WORLD_IDS[0]} phase="morning" mode="light">
      {node}
    </WorldScope>
  );
}

describe('MoveControl', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('moves by one with the buttons', async () => {
    const onMove = vi.fn();
    await render(wrap(<MoveControl label="Notes" place={2} total={4} onMove={onMove} />));
    await fireEvent.press(screen.getByLabelText('Move Notes up'));
    await fireEvent.press(screen.getByLabelText('Move Notes down'));
    expect(onMove.mock.calls).toEqual([[-1], [1]]);
  });

  it('offers no dead ends: the first has no up, the last no down', async () => {
    await render(wrap(<MoveControl label="Notes" place={1} total={1} onMove={vi.fn()} />));
    expect(screen.getByLabelText('Move Notes up').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText('Move Notes down').props.accessibilityState.disabled).toBe(true);
  });

  it('speaks the new place after the floor redraws, not before', async () => {
    const announce = vi.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const onMove = vi.fn();
    const view = await render(
      wrap(<MoveControl label="Notes" place={2} total={4} onMove={onMove} />),
    );
    expect(announce).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Move Notes down'));
    await view.rerender(wrap(<MoveControl label="Notes" place={3} total={4} onMove={onMove} />));
    expect(announce).toHaveBeenCalledWith('Notes, 3 of 4');
  });
});
