import { Command, CommandInput, CommandItem, CommandList } from '@repo/ui/components/ui/command';
import { Text } from '@repo/ui/components/ui/text';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('Command', () => {
  it('filters items and reports selection', async () => {
    const onSelect = vi.fn();
    await render(
      <Command onSelect={onSelect}>
        <CommandInput />
        <CommandList>
          <CommandItem value="Open settings">
            <Text>Open settings</Text>
          </CommandItem>
          <CommandItem value="Sign out">
            <Text>Sign out</Text>
          </CommandItem>
        </CommandList>
      </Command>,
    );

    await fireEvent.changeText(screen.getByLabelText('Search commands'), 'settings');
    expect(screen.getByText('Open settings')).toBeTruthy();
    expect(screen.queryByText('Sign out')).toBeNull();
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Open settings' }));
    expect(onSelect).toHaveBeenCalledWith('Open settings');
  });
});
