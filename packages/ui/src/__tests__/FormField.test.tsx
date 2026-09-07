import { render } from '@testing-library/react-native';
import { FormField } from '../components/ui/form-field';
import { Text } from '../components/ui/text';

describe('FormField (scenario contract)', { tags: ['a11y', 'scenario', 'boundary'] }, () => {
  it('renders helper text for a valid field', async () => {
    const { getByText } = await render(
      <FormField label="Name" helperText="Shown on your profile.">
        <Text>Your name</Text>
      </FormField>,
    );

    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Shown on your profile.')).toBeTruthy();
  });

  it('prioritizes error text over helper text', async () => {
    const { getByText, queryByText } = await render(
      <FormField label="Name" helperText="Shown on your profile." errorText="Name is required.">
        <Text>Your name</Text>
      </FormField>,
    );

    expect(getByText('Name is required.')).toBeTruthy();
    expect(queryByText('Shown on your profile.')).toBeNull();
  });
});
