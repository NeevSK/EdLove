import { MotifLibrary } from '@/core/soul/MotifLibrary';
import { OrnamentLibrary } from '@/core/soul/OrnamentLibrary';
import { type TSLExpression, tsl } from '@/core/soul/tsl';

export type MotifName = keyof typeof MotifLibrary;
export type OrnamentName = keyof typeof OrnamentLibrary;

export interface ScoreDefinition {
  surface: TSLExpression;
  motif?: MotifName;
  ornament?: OrnamentName;
  motifStyle?: 'draft' | 'ink' | 'luminous';
  /**
   * Architectural Rationale (2026 Mandate Requirement).
   * Describes the spiritual or environmental motivation for this generative score.
   */
  rationale?: string;
}

/**
 * ScoreComposer \u2014 Orchestrates the "Performance" of light and form.
 * Combines a base surface soul with generative motif and structural ornament.
 */
export const ScoreComposer = {
  compose: (def: ScoreDefinition): TSLExpression => {
    let result = def.surface;

    // Define "Living Time" - entropy-modulated signal for the entire score
    const livingTime = tsl.mul(tsl.env.time(), tsl.env.entropy());

    // 1. Layer Ornament (Subsurface/Structure)
    if (def.ornament) {
      const ornamentLayer = OrnamentLibrary[def.ornament](tsl.env.uv(), livingTime);
      result = tsl.add(result, ornamentLayer);
    }

    // 2. Layer Motif (Focal Symbolic Light)
    if (def.motif) {
      const motifLayer = MotifLibrary[def.motif](tsl.env.uv(), livingTime, def.motifStyle || 'ink');
      // Blending motif with the base using additive/mix combo for bloom effect
      result = tsl.add(result, tsl.mul(motifLayer, tsl.float(0.8)));
    }

    if (def.rationale) {
      console.log(`[Tr\u00FCbe-Art] [Rationale] ${def.rationale}`);
    }

    return result;
  },
};
