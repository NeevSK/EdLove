import { Combobox } from '@repo/ui/components/ui/combobox';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('Combobox (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary'],
}, () => {
  it('filters options and reports the selected value', async () => {
    const onValueChange = vi.fn();
    await render(
      <Combobox
        value=""
        onValueChange={onValueChange}
        options={[
          { label: 'Sri Lanka', value: 'lk', keywords: ['island'] },
          { label: 'India', value: 'in' },
        ]}
      />,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.changeText(screen.getByLabelText('Search options'), 'island');
    expect(screen.getByText('Sri Lanka')).toBeTruthy();
    expect(screen.queryByText('India')).toBeNull();

    await fireEvent.press(screen.getByRole('menuitem', { name: 'lk' }));
    expect(onValueChange).toHaveBeenCalledWith('lk');
  });

  it('shows an observable empty state when no option matches', async () => {
    await render(
      <Combobox
        onValueChange={vi.fn()}
        options={[{ label: 'Sri Lanka', value: 'lk' }]}
        emptyMessage="No country found"
      />,
    );

    await fireEvent.press(screen.getByRole('combobox'));
    await fireEvent.changeText(screen.getByLabelText('Search options'), 'mars');

    expect(screen.getByText('No country found')).toBeTruthy();
  });
});
