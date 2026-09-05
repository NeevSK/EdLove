import { resolveBlockingScreenState } from '@repo/ui/state/screenState';

describe('blocking screen state contract', () => {
  it('shows a blocking error instead of presenting an outage as an empty screen', () => {
    expect(
      resolveBlockingScreenState({
        hasContent: false,
        isLoading: false,
        error: 'Network unavailable',
      }),
    ).toBe('error');
  });

  it('preserves available content while a refresh fails', () => {
    expect(
      resolveBlockingScreenState({
        hasContent: true,
        isLoading: false,
        error: 'Network unavailable',
      }),
    ).toBe('ready');
  });

  it('uses loading only while there is no safe content to show', () => {
    expect(resolveBlockingScreenState({ hasContent: false, isLoading: true, error: null })).toBe(
      'loading',
    );
    expect(resolveBlockingScreenState({ hasContent: true, isLoading: true, error: null })).toBe(
      'ready',
    );
  });
});
