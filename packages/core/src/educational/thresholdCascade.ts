// packages/core/src/educational/thresholdCascade.ts
// Instantiation of the Universal Layer 0 Threshold Engine for Sri Lankan Educational Realities
// Reference: docs/architecture/2026-10-11-the-upstream-epistemic-and-systemic-invariants.md

import type { ThresholdCascade, ThresholdDefinition } from '../thresholds/types';

/**
 * T0: The Biological / Caloric Nutritional Floor (Ages 0–3)
 */
export const T0_BIOLOGICAL_NUTRITION_FLOOR: ThresholdDefinition = {
  id: 'T0_BIOLOGICAL_NUTRITION_FLOOR',
  name: 'Maternal & Early Childhood Caloric / Protein Floor',
  domain: 'education_biology',
  stratum: 'real',
  cynefin: 'clear',
  criticalValue: 450, // Minimum kcal per school meal / 12g protein
  toleranceBand: { min: 450, max: 750 },
  direction: 'below_breach',
  transitionType: 'phase_change',
  hysteresisMultiplier: 15.0, // Stunting is biologically irreversible
  consequenceDescription:
    'Chronic protein deficiency in early childhood causes irreversible prefrontal cortex volume loss and stunting. Cognitive bandwidth reduced by up to 30%, which no future tutoring can undo.',
  convivialIntervention:
    'Universal state midday hot meal (dhal, rice, egg/sprats) and community nutritional floor before any formal testing.',
};

/**
 * T1: The Grade 4 Matthew Reading Watershed (Age 8–9)
 * Keith Stanovich's transition from "Learning to Read" to "Reading to Learn"
 */
export const T1_GRADE4_MATTHEW_READING: ThresholdDefinition = {
  id: 'T1_GRADE4_MATTHEW_READING',
  name: 'Grade 4 Reading Automaticity Watershed ("Reading to Learn")',
  domain: 'education_pedagogy',
  stratum: 'real',
  cynefin: 'complex',
  criticalValue: 60, // Autonomous words-per-minute comprehension threshold
  toleranceBand: { min: 65, max: 110 },
  direction: 'below_breach',
  transitionType: 'matthew_divergence',
  matthewGrowthRate: 0.35, // Divergence compounds rapidly each academic term
  hysteresisMultiplier: 8.0, // Remediation at Grade 10 costs 8x more than Grade 3
  consequenceDescription:
    'At Grade 4, textbooks stop teaching reading and expect reading to learn. Children below the decoding threshold exhaust working memory on letters, cannot comprehend science or math word problems, disengage, and fall into cumulative deficit.',
  convivialIntervention:
    'Mother-tongue oral storytelling circles, picture library immersion, zero high-stakes testing, and phonetic reading buddies before Grade 4 closes.',
};

/**
 * T2: The Grade 5 Shishyatvaya Sorting Gateway (Age 10)
 */
export const T2_GRADE5_SHISHYATVAYA_GATEWAY: ThresholdDefinition = {
  id: 'T2_GRADE5_SHISHYATVAYA_GATEWAY',
  name: 'Grade 5 Scholarship Institutional Sorting Gateway',
  domain: 'education_institutional',
  stratum: 'empirical',
  cynefin: 'complicated',
  criticalValue: 153, // Typical competitive district cutoff (e.g., Colombo / Gampaha)
  toleranceBand: { min: 150, max: 200 },
  direction: 'below_breach',
  transitionType: 'bifurcation',
  hysteresisMultiplier: 6.0,
  consequenceDescription:
    'Separates students into National 1AB Flagship Central Colleges vs underfunded Type 2/3 rural schools. Missing the cutoff locks the student out of schools with A/L science laboratories and elite alumni networks.',
  convivialIntervention:
    'Equitable regional school clusters and capital distribution so no child has to leave their home village to access science education.',
};

/**
 * T3: The Grade 9 Adolescent Identity & Pre-O/L Existential Crisis (Age 14–15)
 * Roy Bhaskar's Depth Real: Biological Individuation vs. Bureaucratic Panopticon
 */
export const T3_GRADE9_ADOLESCENT_WATERSHED: ThresholdDefinition = {
  id: 'T3_GRADE9_ADOLESCENT_WATERSHED',
  name: 'Grade 9 Adolescent Identity & Pre-O/L Existential Watershed',
  domain: 'education_ontogenetic',
  stratum: 'real',
  cynefin: 'complex',
  criticalValue: 50, // Relational connection index (0-100)
  toleranceBand: { min: 55, max: 100 },
  direction: 'below_breach',
  transitionType: 'bifurcation',
  hysteresisMultiplier: 10.0,
  consequenceDescription:
    'The biological emergence of adult autonomy and existential questioning collides with the infantilizing panopticon of 9 standardized O/L exam subjects. Leads to acute disengagement, silent teen rebellion, and panic-driven shadow tuition dependency.',
  convivialIntervention:
    'Convivial rites of passage: authentic community projects, vocational craft apprenticeships, aesthetic choices, and unhurried dialogue treating teenagers as emerging adults rather than exam automata.',
};

/**
 * T4: The Grade 11 G.C.E. O/L Stream Split Gateway (Age 16)
 */
export const T4_GRADE11_OL_STREAM_SPLIT: ThresholdDefinition = {
  id: 'T4_GRADE11_OL_STREAM_SPLIT',
  name: 'G.C.E. Ordinary Level Stream Sorting Gateway',
  domain: 'education_credential',
  stratum: 'empirical',
  cynefin: 'complicated',
  criticalValue: 6, // Minimum credit passes including Mathematics and First Language
  toleranceBand: { min: 6, max: 9 },
  direction: 'below_breach',
  transitionType: 'bifurcation',
  hysteresisMultiplier: 5.0,
  consequenceDescription:
    'Failing Mathematics or Science locks the student out of G.C.E. A/L Bio/Maths streams, shunting them into Arts streams or early school exit with zero marketable credentials.',
  convivialIntervention:
    'Modular mastery assessment, practical vocational certification parity (NVQ 1-4), and abolition of single-sitting high-stakes exit terror.',
};

/**
 * T5: The Grade 13 G.C.E. A/L Z-Score Crucible & Transclasse Threshold (Age 19–25)
 */
export const T5_GRADE13_AL_ZSCORE_CRUCIBLE: ThresholdDefinition = {
  id: 'T5_GRADE13_AL_ZSCORE_CRUCIBLE',
  name: 'G.C.E. Advanced Level Z-Score Crucible & Transclasse Threshold',
  domain: 'education_positional',
  stratum: 'real',
  cynefin: 'complex',
  criticalValue: 1.5, // Representative state university cutoff Z-score
  toleranceBand: { min: 1.2, max: 3.0 },
  direction: 'below_breach',
  transitionType: 'matthew_divergence',
  matthewGrowthRate: 0.2,
  hysteresisMultiplier: 12.0,
  consequenceDescription:
    'Rations access to 35,000 free state university seats across 300,000 candidates. Those who fail face multi-million-rupee private degree debt or precarious informal labor. Those who pass face the transclasse wound: psychological alienation from their home soil and family roots.',
  convivialIntervention:
    'Decentralized regional polytechnic colleges, open access degree apprenticeships, and communal psychological reconciliation for upwardly mobile youth.',
};

/**
 * The Canonical 6-Gateway Educational Life Chances Cascade
 */
export const SRI_LANKA_EDUCATIONAL_THRESHOLD_CASCADE: ThresholdCascade<string> = {
  id: 'SRI_LANKA_EDUCATIONAL_THRESHOLD_CASCADE',
  name: 'Sri Lanka 13-Year Educational Life Chances Threshold Cascade',
  domain: 'education',
  gateways: [
    {
      order: 1,
      stage: 'T0_infancy_nutrition',
      threshold: T0_BIOLOGICAL_NUTRITION_FLOOR,
      pathDependencyLockInRisk: 'Chronic cognitive stunting irrecoverable by later schooling.',
    },
    {
      order: 2,
      stage: 'T1_grade4_matthew_reading',
      threshold: T1_GRADE4_MATTHEW_READING,
      pathDependencyLockInRisk:
        'Compounding literacy deficit causing failure across all academic subjects.',
    },
    {
      order: 3,
      stage: 'T2_grade5_shishyatvaya',
      threshold: T2_GRADE5_SHISHYATVAYA_GATEWAY,
      pathDependencyLockInRisk:
        'Institutional isolation in rural school without A/L science streams.',
    },
    {
      order: 4,
      stage: 'T3_grade9_adolescent_identity',
      threshold: T3_GRADE9_ADOLESCENT_WATERSHED,
      pathDependencyLockInRisk:
        'Psychological alienation, burnout, and premature academic surrender.',
    },
    {
      order: 5,
      stage: 'T4_grade11_ol_gateway',
      threshold: T4_GRADE11_OL_STREAM_SPLIT,
      pathDependencyLockInRisk: 'Barred from STEM tracks and sorted into credential precarity.',
    },
    {
      order: 6,
      stage: 'T5_grade13_al_zscore',
      threshold: T5_GRADE13_AL_ZSCORE_CRUCIBLE,
      pathDependencyLockInRisk:
        'Lifelong economic stratification and transclasse cultural dislocation.',
    },
  ],
};
