import { describe, expect, it } from 'vitest';
import { initialProfileState, profileReducer } from './useProfile';

describe('profile fetch state', () => {
  it('settles a development runtime failure instead of leaving the initial loader active', () => {
    const loadingState = profileReducer(initialProfileState, { type: 'FETCH_START' });
    const resolvedState = profileReducer(loadingState, {
      type: 'FETCH_FAILURE',
      payload: 'Expected HMRClient.setup() call at startup.',
    });

    expect(resolvedState).toMatchObject({
      loading: false,
      refreshing: false,
      error: 'Expected HMRClient.setup() call at startup.',
    });
  });
});
