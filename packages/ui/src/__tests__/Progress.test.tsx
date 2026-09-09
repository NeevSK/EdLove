import { render } from '@testing-library/react-native';
import { Progress, ProgressFilledTrack } from '../components/ui/progress';

describe('Progress Component (scenario contract)', {
  tags: ['a11y', 'scenario', 'boundary'],
}, () => {
  it('renders correctly with value', async () => {
    const { getByTestId } = await render(
      <Progress value={50} testID="progress-bar">
        <ProgressFilledTrack />
      </Progress>,
    );

    const progress = getByTestId('progress-bar');
    expect(progress.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 });
  });
});
