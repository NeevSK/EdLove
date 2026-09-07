import { render } from '@testing-library/react-native';

vi.mock('../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({ isReduceMotionEnabled: true }),
}));

import { BrandPulse } from '../BrandPulse';

describe('BrandPulse', () => {
  it('announces loading without relying on the visual signal', async () => {
    const { getByRole } = await render(
      <BrandPulse accessibilityLabel="Loading sanctuary resources" size={32} />,
    );

    expect(getByRole('progressbar', { name: 'Loading sanctuary resources' })).toBeTruthy();
  });
});
