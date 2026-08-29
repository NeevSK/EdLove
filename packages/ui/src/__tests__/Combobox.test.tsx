import { fireEvent, render, screen } from '@testing-library/react-native';
import { Combobox } from '@repo/ui/components/ui/combobox';

describe('Combobox', () => {
  it('filters options and reports the selected value', async () => {
    const onValueChange = jest.fn();
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
});
