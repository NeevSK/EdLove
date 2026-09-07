import { fireEvent, render } from '@testing-library/react-native';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Text } from '../components/ui/text';

describe('Popover', () => {
  it('toggles content and closes through its close control', async () => {
    const onOpenChange = vi.fn();
    const { getByText, queryByText, rerender } = await render(
      <Popover open={false} onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <Text>More</Text>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverClose>
            <Text>Close</Text>
          </PopoverClose>
        </PopoverContent>
      </Popover>,
    );

    expect(queryByText('Close')).toBeNull();
    await fireEvent.press(getByText('More'));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await rerender(
      <Popover open onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <Text>More</Text>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverClose>
            <Text>Close</Text>
          </PopoverClose>
        </PopoverContent>
      </Popover>,
    );
    await fireEvent.press(getByText('Close'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
