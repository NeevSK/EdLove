export type BlockingScreenState = 'loading' | 'error' | 'ready';

export type BlockingScreenStateInput = {
  hasContent: boolean;
  isLoading: boolean;
  error: string | null;
};

/**
 * Resolves only the states that may replace a screen's content. A failure
 * never masks already-rendered safe data; it is represented as inline status
 * until a feature supplies a more specific recovery experience.
 */
export function resolveBlockingScreenState({
  hasContent,
  isLoading,
  error,
}: BlockingScreenStateInput): BlockingScreenState {
  if (!hasContent && error) return 'error';
  if (!hasContent && isLoading) return 'loading';
  return 'ready';
}
