import { mix } from '../color';
import type { WorldTokens } from '../types';

type BaseTokens = Omit<WorldTokens, 'line'>;

/** A palette with its hairline derived from ground and ink. */
export function tokens(base: BaseTokens, lineAmount = 0.2): WorldTokens {
  return { ...base, line: mix(base.ground, base.ink, lineAmount) };
}
