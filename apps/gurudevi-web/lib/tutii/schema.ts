// apps/gurudevi-web/lib/tutii/schema.ts

export type UserRolePerspective =
  | 'teacher' // Class educator, subject teacher
  | 'principal' // School leader, administrator
  | 'student' // Young learner
  | 'guardian' // Family & parent
  | 'universal'; // Appears across all perspectives

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface tutiiStepAction {
  id: string;
  label: string;
  kind: 'primary' | 'secondary' | 'dismiss';
}

export interface tutiiStepSpec {
  id: string;
  targetSelector: string; // CSS selector to target for the spotlight
  fallbackSelector?: string; // Alternative selector if primary is missing
  title?: string;
  narration: string; // Everyday, casual, functional copy (1-2 sentences)
  preferredPlacement?: PopoverPlacement;
  highlightPadding?: number; // Padding around element in px (default 8)
  borderRadius?: number; // Target border radius in px (default 12)
  applicableRoles?: UserRolePerspective[];
  actions?: tutiiStepAction[];
}

export interface tutiiJourneySpec {
  id: string;
  version: number;
  title: string;
  targetRole?: UserRolePerspective;
  allowSkip: boolean;
  rememberDismissal: boolean; // Persist completion/skip in localStorage
  steps: tutiiStepSpec[];
}

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export interface ComputedPlacement {
  mode: 'floating' | 'bottom-sheet';
  top: number;
  left: number;
  arrowSide?: 'top' | 'bottom' | 'left' | 'right';
}
