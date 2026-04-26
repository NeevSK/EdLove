import { render } from '@testing-library/react-native';
import { Progress, ProgressFilledTrack } from '../components/ui/progress';

describe('Progress Component (Robustness)', () => {
  it('renders correctly with value', async () => {
    const { getByTestId } = await render(
      <Progress value={50} testID="progress">
        <ProgressFilledTrack testID="filled-track" />
      </Progress>,
    );
    // Filled track should have width 50%
  });
});
