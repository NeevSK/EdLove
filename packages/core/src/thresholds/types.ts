// packages/core/src/thresholds/types.ts
// Universal Layer 0 Epistemic Contracts: Stratified Ontology, Non-Systems & Threshold Cascades
// Reference: docs/architecture/2026-10-11-the-upstream-epistemic-and-systemic-invariants.md

/**
 * Roy Bhaskar's Critical Realist Stratified Ontology
 */
export type OntologicalStratum =
  | 'empirical' // The surface: measurements, scores, logs, data tables
  | 'actual' // The events: occurrences in time and space, observed or unobserved
  | 'real'; // The deep generative mechanisms: biological limits, class power, thermodynamic entropy

/**
 * The Six Non-System Categories (Banishing Systems-Washing)
 */
export type NonSystemKind =
  | 'aggregate_heap' // Collections without relations; decomposable (sand, raw CSVs)
  | 'milieu_ground' // Ambient carrying capacity & friction (nutrition, climate, mother tongue)
  | 'seed_germ' // Latent generative entelechy awaiting environmental mediation
  | 'artifact_tool' // Passive human instruments of leverage (chalkboard, SQLite, PostGIS)
  | 'flux_gradient' // Boundaryless dynamic currents (inflation, panic, weather)
  | 'simulacrum_phantom'; // Closed bureaucratic paperwork severed from physical ground truth

/**
 * The Three True Systems
 */
export type SystemKind =
  | 'mechanism' // Engineered, deterministic, decomposable clockwork/code
  | 'organism' // Living, autopoietic, non-decomposable whole
  | 'convivial_polity'; // Human-scaled community bound by mutual trust with natural ceilings

/**
 * Dave Snowden's Cynefin Sense-Making Domains
 */
export type CynefinDomain =
  | 'clear' // Predictable, SOP, Sense-Categorize-Respond
  | 'complicated' // Expert analysis, Sense-Analyze-Respond
  | 'complex' // Emergent, living human relations, Probe-Sense-Respond
  | 'chaotic' // Immediate triage, Act-Sense-Respond
  | 'aporia'; // Confused state of mistaking Complex for Clear

/**
 * Dynamics of Threshold Phase Transitions
 */
export type ThresholdTransitionType =
  | 'linear_boundary' // Fixed operational boundary
  | 'bifurcation' // Non-linear branching into alternate attractors
  | 'phase_change' // Sudden structural transition (water -> steam)
  | 'matthew_divergence' // Compounding gap: gap(t) = gap0 * e^(lambda * t)
  | 'hysteresis_collapse'; // Asymmetric collapse where recovery cost >> prevention cost

/**
 * Direction of breach relative to critical threshold
 */
export type ThresholdBreachDirection = 'above_breach' | 'below_breach';

/**
 * Universal Domain-Agnostic Threshold Definition
 */
export interface ThresholdDefinition<TContext = Record<string, unknown>> {
  id: string;
  name: string;
  domain: string; // e.g., 'education', 'healthcare', 'agrarian_hydrology', 'software_systems'
  stratum: OntologicalStratum;
  cynefin: CynefinDomain;
  criticalValue: number;
  toleranceBand: {
    min: number;
    max: number;
  };
  direction: ThresholdBreachDirection;
  transitionType: ThresholdTransitionType;
  /**
   * Exponential divergence coefficient lambda for Matthew effect:
   * delta_gap(t) = delta_gap_0 * exp(lambda * t)
   */
  matthewGrowthRate?: number;
  /**
   * Hysteresis recovery cost multiplier: Cost(recovery) / Cost(prevention)
   * Typically 3x to 20x.
   */
  hysteresisMultiplier?: number;
  consequenceDescription: string;
  convivialIntervention: string;
  context?: TContext;
}

/**
 * Evaluation Result of a Metric Against a Defined Threshold
 */
export interface ThresholdEvaluationResult {
  thresholdId: string;
  thresholdName: string;
  currentValue: number;
  criticalValue: number;
  isBreached: boolean;
  /**
   * Distance to breach as a percentage (-100% to +100%).
   * Positive means healthy margin; negative means past breach.
   */
  safetyMarginPct: number;
  status: 'safe' | 'warning' | 'breached' | 'catastrophic';
  /**
   * Projected gap under the Matthew Effect over N periods:
   * gap(t) = initialGap * exp(lambda * t)
   */
  calculateMatthewGap: (initialGap: number, timePeriods: number) => number;
  estimatedRecoveryCostMultiplier: number;
  convivialRecommendation: string;
}

/**
 * A Sequential Gateway in an Educational or Life Cascade
 */
export interface CascadeGateway<TStage = string, TContext = Record<string, unknown>> {
  order: number;
  stage: TStage;
  threshold: ThresholdDefinition<TContext>;
  pathDependencyLockInRisk: string;
}

/**
 * Cascade of Interdependent Threshold Gateways
 */
export interface ThresholdCascade<TStage = string, TContext = Record<string, unknown>> {
  id: string;
  name: string;
  domain: string;
  gateways: CascadeGateway<TStage, TContext>[];
}
