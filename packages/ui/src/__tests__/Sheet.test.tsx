import { render, screen } from '@testing-library/react-native';
import { Sheet, SheetContent, SheetItem, SheetItemText } from '@repo/ui/components/ui/sheet';

describe('Sheet', () => {
  it('uses the source-owned actionsheet behavior with the open API', async () => {
    await render(
      <Sheet open onOpenChange={jest.fn()}>
        <SheetContent>
          <SheetItem onPress={jest.fn()}>
            <SheetItemText>Choose an option</SheetItemText>
          </SheetItem>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByText('Choose an option')).toBeTruthy();
    expect(screen.getByRole('menu')).toBeTruthy();
  });
});
