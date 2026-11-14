import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorldScope } from '../../../theme/native';
import { haptic } from '../../../utils/haptics';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { TextField } from '../TextField/TextField';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));

beforeEach(() => vi.mocked(haptic).mockClear());

describe('components speak the feedback grammar', { tags: ['interaction', 'unit'] }, () => {
  it('a button press feels as firm as its world: soft in Sanctuary, crisp in Spark', async () => {
    const { unmount } = await render(
      <WorldScope world="sanctuary" phase="morning" mode="light">
        <Button label="Save" onPress={() => {}} />
      </WorldScope>,
    );
    await fireEvent(screen.getByRole('button', { name: 'Save' }), 'pressIn');
    expect(haptic).toHaveBeenLastCalledWith('light');
    await unmount();
    const crisp = WORLD_CRISP();
    await render(
      <WorldScope world={crisp} phase="morning" mode="light">
        <Button label="Save" onPress={() => {}} />
      </WorldScope>,
    );
    await fireEvent(screen.getByRole('button', { name: 'Save' }), 'pressIn');
    expect(haptic).toHaveBeenLastCalledWith('medium');
  });

  it('haptic={false} keeps a button silent', async () => {
    await render(<Button label="Quiet" haptic={false} onPress={() => {}} />);
    await fireEvent(screen.getByRole('button', { name: 'Quiet' }), 'pressIn');
    expect(haptic).not.toHaveBeenCalled();
  });

  it('a choice ticks', async () => {
    await render(<Checkbox label="Notify" checked={false} onChange={() => {}} />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Notify' }));
    expect(haptic).toHaveBeenLastCalledWith('selection');
  });

  it('a field feels an error when it appears, not while it stays', async () => {
    const { rerender } = await render(<TextField label="Email" value="x" />);
    expect(haptic).not.toHaveBeenCalled();
    await act(() => rerender(<TextField label="Email" value="x" error="Enter an email address" />));
    expect(haptic).toHaveBeenCalledWith('error');
    await act(() =>
      rerender(<TextField label="Email" value="xy" error="Enter an email address" />),
    );
    expect(haptic).toHaveBeenCalledTimes(1);
  });
});

import { WORLD_IDS, WORLDS } from '../../../theme/worlds';

function WORLD_CRISP() {
  const id = WORLD_IDS.find((w) => WORLDS[w].motion.haptic === 'crisp');
  if (!id) throw new Error('no crisp world');
  return id;
}
