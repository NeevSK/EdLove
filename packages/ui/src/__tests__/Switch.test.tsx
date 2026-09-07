import { fireEvent, render, screen } from '@testing-library/react-native';
import { Switch } from '../components/ui/switch';

describe('Switch (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary'],
}, () => {
  it('exposes its state and reports a user transition', async () => {
    const onValueChange = vi.fn();

    await render(
      <Switch value={false} onValueChange={onValueChange} accessibilityLabel="Notifications" />,
    );

    const control = screen.getByRole('switch', { name: 'Notifications' });
    expect(control.props.value).toBe(false);
    expect(control.props.disabled).not.toBe(true);

    fireEvent(control, 'valueChange', true);

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('blocks interaction when disabled', async () => {
    const onValueChange = vi.fn();

    await render(
      <Switch
        value={true}
        isDisabled
        onValueChange={onValueChange}
        accessibilityLabel="Notifications"
      />,
    );

    const control = screen.getByRole('switch', { name: 'Notifications' });
    expect(control.props.disabled).toBe(true);

    expect(control.props.onValueChange).toBeUndefined();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
