import { Dialog, DialogBody, DialogContent } from '@repo/ui/components/ui/dialog';
import { Text } from '@repo/ui/components/ui/text';
import { render, screen } from '@testing-library/react-native';

describe('Dialog', () => {
  it('uses the source-owned modal behavior with the open API', async () => {
    const onOpenChange = jest.fn();

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
});
