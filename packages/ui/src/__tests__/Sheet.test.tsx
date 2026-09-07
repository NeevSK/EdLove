import { Sheet, SheetContent, SheetItem, SheetItemText } from '@repo/ui/components/ui/sheet';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

describe('Sheet (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary'],
}, () => {
  it('uses the source-owned actionsheet behavior with the open API', async () => {
    await render(
      <Sheet open onOpenChange={vi.fn()}>
        <SheetContent>
          <SheetItem onPress={vi.fn()}>
            <SheetItemText>Choose an option</SheetItemText>
          </SheetItem>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByText('Choose an option')).toBeTruthy();
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('removes sheet content when the controlled value closes', async () => {
    const onOpenChange = vi.fn();
    const { rerender, queryByText } = await render(
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetItemText>Choose an option</SheetItemText>
        </SheetContent>
      </Sheet>,
    );

    expect(queryByText('Choose an option')).toBeTruthy();

    await rerender(
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetItemText>Choose an option</SheetItemText>
        </SheetContent>
      </Sheet>,
    );

    expect(queryByText('Choose an option')).toBeNull();
  });
});
