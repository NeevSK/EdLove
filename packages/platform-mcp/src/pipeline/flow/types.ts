export type RiskTier = 'standard' | 'sensitive' | 'critical';

export interface FlowMetadata {
  id: string;
  version: `${number}.${number}.${number}`;
  domain: string;
  riskTier: RiskTier;
  targetEngines: {
    expo: string;
    react: string;
  };
  schemaHash?: string;
  author?: string;
  lastUpdated?: string;
  multiActor?: boolean;
}

export type IngressType = 'cold_boot' | 'deep_link' | 'in_app' | 'push_notification' | 'qr_scan';

export interface IngressVector {
  type: IngressType;
  deepLinkPattern?: string;
  sourceScreen?: string;
}

export interface AdmissionGuard {
  name: string;
  predicate: string;
  onFailureBounceRoute: string;
}

export interface MotionRecipe {
  type: 'SPRING' | 'TIMING' | 'VIEW_TRANSITION';
  damping?: number;
  stiffness?: number;
  mass?: number;
  durationMs?: number;
  enterTransition?: string;
  haptic?: 'light' | 'medium' | 'heavy' | 'selection' | 'error' | 'warning';
  reducedMotionFallback?: 'instant' | 'fade';
}

export interface DataSeam {
  type: 'OPTIMISTIC_SQLITE_INSERT' | 'SQLITE_MUTATION' | 'REMOTE_ORPC' | 'SSE_STREAM' | 'BATCH_TRANSACTION';
  table?: string;
  operation?: string;
  idempotencyKey?: boolean;
  initialStatus?: string;
  reconnectSchedule?: number[];
  secondaryTables?: Array<{ table: string; operation: string; status?: string }>;
}

export interface InvariantEnvelope {
  rlsPolicy: string;
  softDeleteField: string;
  forbiddenDialects: string[];
  tenantIsolationField: string;
}

export interface UIElementMock {
  id: string;
  type: 'button' | 'text' | 'input' | 'list' | 'badge' | 'banner' | 'skeleton' | 'avatar' | 'haptic';
  label: string;
  state?: 'enabled' | 'disabled' | 'loading' | 'active' | 'hidden';
  accessibilityLabel?: string;
}

export interface VisualFrame {
  screenTitle: string;
  headerText?: string;
  elements: UIElementMock[];
  banner?: { text: string; kind: 'info' | 'warning' | 'error' | 'success' };
  keyboardVisible?: boolean;
}

export interface EventTransition {
  guard?: string;
  targetState: string;
  actor?: 'author' | 'reviewer' | 'system' | 'collaborator';
  undoWindowMs?: number;
  motion?: MotionRecipe;
  dataMutation?: DataSeam;
}

export interface StateNode {
  screen: string;
  component: string;
  surface?: 'personal_space' | 'library_shared' | 'reader_modal' | 'reviewer_desk' | 'modal';
  keyboardAvoidance?: 'adjustResize' | 'adjustPan' | 'none';
  userContextDescription?: string;
  visualFrame?: VisualFrame;
  errorCopy?: Record<string, string>;
  onEvents: Record<string, EventTransition>;
}

export interface TerminalNode {
  type: 'success' | 'failure' | 'cancelled';
  convergence: 'stay_in_screen' | 'pop_screen' | 'replace_screen' | 'celebration_floor';
  action?: string;
  uiBadge?: string;
  haptic?: 'light' | 'selection' | 'error';
  retryEvent?: string;
  visualFrame?: VisualFrame;
}

export interface ScenarioStep {
  event: string;
  payload?: Record<string, unknown>;
  expectedState: string;
  assertion: string;
}

export interface UserScenario {
  id: string;
  title: string;
  persona: string;
  initialIngress: IngressType;
  steps: ScenarioStep[];
  expectedTerminal: string;
}

export interface AcceptanceCriterion {
  id: string;
  title: string;
  rule: string;
  verifiedByScenario: string;
}

export interface PersonaProfile {
  role: string;
  device: string;
  network: string;
  description: string;
}

export interface FlowDefinition {
  metadata: FlowMetadata;
  personas?: PersonaProfile[];
  ingress: {
    supportedVectors: IngressVector[];
    guards: AdmissionGuard[];
  };
  states: Record<string, StateNode>;
  terminals: Record<string, TerminalNode>;
  invariants: InvariantEnvelope;
  scenarios?: Record<string, UserScenario>;
  acceptanceCriteria?: AcceptanceCriterion[];
}

export interface FlowValidationReceipt {
  journeyId: string;
  version: string;
  valid: boolean;
  totalStates: number;
  totalTerminals: number;
  errors: string[];
  warnings: string[];
}
