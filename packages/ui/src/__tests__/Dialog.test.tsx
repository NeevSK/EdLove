import { Dialog, DialogBody, DialogClose, DialogContent } from '@repo/ui/components/ui/dialog';
import { Text } from '@repo/ui/components/ui/text';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('Dialog (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary'],
}, () => {
  it('uses the source-owned modal behavior with the open API', async () => {
    const onOpenChange = vi.fn();

    await render(
      <Dialog open onOpenChange={onOpenChange} accessibilityLabel="Example dialog">
        <DialogContent>
          <DialogBody>
            <Text>Dialog content</Text>
          </DialogBody>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText('Dialog content')).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('reports close-button dismissal through the controlled API', async () => {
    const onOpenChange = vi.fn();

    await render(
      <Dialog open onOpenChange={onOpenChange} accessibilityLabel="Example dialog">
        <DialogContent>
          <DialogBody>
            <DialogClose accessibilityLabel="Close dialog">
              <Text>Close</Text>
            </DialogClose>
          </DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Close dialog' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('dismisses from the backdrop by default', async () => {
    const onOpenChange = vi.fn();

    await render(
      <Dialog open onOpenChange={onOpenChange} accessibilityLabel="Example dialog">
        <DialogContent>
          <DialogBody>
            <Text>Dialog content</Text>
          </DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.press(screen.getByRole('button', { name: 'backdrop' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('honors an explicit backdrop-dismissal policy', async () => {
    const onOpenChange = vi.fn();

    await render(
      <Dialog
        open
        onOpenChange={onOpenChange}
        closeOnBackdropPress={false}
        accessibilityLabel="Example dialog"
      >
        <DialogContent>
          <DialogBody>
            <Text>Dialog content</Text>
          </DialogBody>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.press(screen.getByRole('button', { name: 'backdrop' }));

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
