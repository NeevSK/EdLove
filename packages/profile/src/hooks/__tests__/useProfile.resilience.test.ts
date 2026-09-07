import { describe, expect, it } from 'vitest';
import { initialProfileState, profileReducer } from '../useProfile';

describe('useProfile resilience & guest state', () => {
  it('initializes in loading state without active error', () => {
    expect(initialProfileState).toEqual({
      profile: null,
      loading: true,
      refreshing: false,
      error: null,
    });
  });

  it('handles guest profile fetch success without network dependencies', () => {
    const guestProfile = {
      id: 'guest',
      email: null,
      display_name: 'Guest Explorer',
      avatar_url: null,
      capacity: 'guest',
      school_id: null,
      school_name: null,
      organization_name: null,
      is_anonymous: true,
      created_at: '2026-09-01T00:00:00.000Z',
      updated_at: '2026-09-01T00:00:00.000Z',
    } as any;

    const nextState = profileReducer(initialProfileState, {
      type: 'FETCH_SUCCESS',
      payload: guestProfile,
    });

    expect(nextState).toEqual({
      profile: guestProfile,
      loading: false,
      refreshing: false,
      error: null,
    });
  });

  it('supports optimistic field updates without throwing', () => {
    const baseState = {
      profile: {
        id: 'user-1',
        display_name: 'Old Name',
      } as any,
      loading: false,
      refreshing: false,
      error: null,
    };

    const updatedState = profileReducer(baseState, {
      type: 'UPDATE_FIELD',
      field: 'display_name',
      value: 'New Name',
    });

    expect(updatedState.profile?.display_name).toBe('New Name');
  });
});
