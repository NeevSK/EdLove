import { fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';

import { SanctuaryDoorwayActions } from '../SanctuaryDoorwayActions';

describe('SanctuaryDoorwayActions', () => {
  it('invokes each public-entry action through the primitive button host', async () => {
    const onExploreGuest = vi.fn();
    const onSignIn = vi.fn();
    const { getByLabelText } = await render(
      <SanctuaryDoorwayActions onExploreGuest={onExploreGuest} onSignIn={onSignIn} />,
    );

    await fireEvent.press(getByLabelText('Explore as Guest'));
    await fireEvent.press(getByLabelText('I have an account. Log In'));

    expect(onExploreGuest).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

});
