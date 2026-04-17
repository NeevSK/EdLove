import { UserContext } from './schemas/user.schema';

/**
 * FeatureFlags - The central registry of all boolean switches in the Gurudevi Sanctuary.
 * 
 * FAANG Principle: "Strongly Typed Gates". Never use magic strings in the UI.
 */
export interface FeatureFlags {
  // Infrastructure Flags (Deployment Gating)
  isInventoryEnabled: boolean;
  isLibraryManagementEnabled: boolean;
  
  // Business Flags (Entitlements / Tiers)
  isProMember: boolean;
  canUseOCR: boolean;
  isAIAssistantEnabled: boolean;

  // Experimental / Beta Flags
  isPublicSensingEnabled: boolean;
  isNewOnboardingEnabled: boolean;
  isGuardianWorkspaceEnabled: boolean;
  isStudentAssignmentQueueEnabled: boolean;
  isStudentGoalsWorkspaceEnabled: boolean;
  isStudentGradesWorkspaceEnabled: boolean;
  isStudentProgressWorkspaceEnabled: boolean;
  isStudentRewardsWorkspaceEnabled: boolean;

  // Global Safety Flags (Kill Switches)
  isUnderMaintenance: boolean;
}

/**
 * resolveFeatureFlags: The Hierarchical Resolution Engine.
 */
export type ExposureHandler = (flag: string, value: boolean | string) => void;
let exposureHandler: ExposureHandler | null = null;

/** Register a callback for analytics (e.g. PostHog) to track flag usage */
export const setFeatureExposureHandler = (handler: ExposureHandler) => {
  exposureHandler = handler;
};

/** Internal utility to trigger the exposure callback */
export const trackFeatureExposureInternal = (flag: string, value: boolean | string) => {
  exposureHandler?.(flag, value);
};

export const resolveFeatureFlags = (

  context: UserContext,
  globalConfigs: Record<string, string | boolean> = {}
): FeatureFlags => {
  // 0. Default Safe Harbor State
  const flags: FeatureFlags = {
    isInventoryEnabled: false,
    isLibraryManagementEnabled: true,
    isProMember: false,
    canUseOCR: false,
    isAIAssistantEnabled: false,
    isPublicSensingEnabled: true,
    isNewOnboardingEnabled: false,
    isGuardianWorkspaceEnabled: false,
    isStudentAssignmentQueueEnabled: true,
    isStudentGoalsWorkspaceEnabled: true,
    isStudentGradesWorkspaceEnabled: true,
    isStudentProgressWorkspaceEnabled: true,
    isStudentRewardsWorkspaceEnabled: false,
    isUnderMaintenance: false};

  // 1. Infrastructure Level (Process Env)
  // Note: Expo/Next.js bundle these at build time
  const envFlags = {
    ERP: process.env.EXPO_PUBLIC_ENABLE_ERP === 'true' || process.env.NEXT_PUBLIC_ENABLE_ERP === 'true',
    NEW_ONBOARDING: process.env.EXPO_PUBLIC_ENABLE_NEW_ONBOARDING === 'true',
    GUARDIAN_WORKSPACE:
      process.env.EXPO_PUBLIC_ENABLE_GUARDIAN_WORKSPACE === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_GUARDIAN_WORKSPACE === 'true',
    STUDENT_REWARDS_WORKSPACE:
      process.env.EXPO_PUBLIC_ENABLE_STUDENT_REWARDS_WORKSPACE === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_STUDENT_REWARDS_WORKSPACE === 'true',
    STUDENT_GOALS_WORKSPACE:
      process.env.EXPO_PUBLIC_ENABLE_STUDENT_GOALS_WORKSPACE === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_STUDENT_GOALS_WORKSPACE === 'true',
    STUDENT_GRADES_WORKSPACE:
      process.env.EXPO_PUBLIC_ENABLE_STUDENT_GRADES_WORKSPACE === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_STUDENT_GRADES_WORKSPACE === 'true',
    STUDENT_PROGRESS_WORKSPACE:
      process.env.EXPO_PUBLIC_ENABLE_STUDENT_PROGRESS_WORKSPACE === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_STUDENT_PROGRESS_WORKSPACE === 'true'};

  if (envFlags.ERP) flags.isInventoryEnabled = true;
  if (envFlags.NEW_ONBOARDING) flags.isNewOnboardingEnabled = true;
  if (envFlags.GUARDIAN_WORKSPACE) flags.isGuardianWorkspaceEnabled = true;
  if (envFlags.STUDENT_REWARDS_WORKSPACE) flags.isStudentRewardsWorkspaceEnabled = true;
  if (envFlags.STUDENT_GOALS_WORKSPACE) flags.isStudentGoalsWorkspaceEnabled = true;
  if (envFlags.STUDENT_GRADES_WORKSPACE) flags.isStudentGradesWorkspaceEnabled = true;
  if (envFlags.STUDENT_PROGRESS_WORKSPACE) flags.isStudentProgressWorkspaceEnabled = true;

  // 2. Entitlement Level (Tier & Features Array)
  const isPaidTier = ['pro', 'premium', 'gold', 'silver'].includes(context.tier?.toLowerCase() || '');
  const isAdmin = ['admin', 'founder', 'developer'].includes(context.authority || '');

  flags.isProMember = isPaidTier || isAdmin;
  
  if (context.features.includes('OCR') || isAdmin) flags.canUseOCR = true;
  if (context.features.includes('AI_ASSISTANT') || isAdmin) flags.isAIAssistantEnabled = true;
  if (context.features.includes('BETA_TESTER')) flags.isNewOnboardingEnabled = true;
  if (
    context.features.includes('GUARDIAN_WORKSPACE') ||
    context.features.includes('BETA_GUARDIAN_WORKSPACE')
  ) {
    flags.isGuardianWorkspaceEnabled = true;
  }
  if (context.features.includes('STUDENT_REWARDS_WORKSPACE') || context.features.includes('BETA_STUDENT_WORKSPACE')) {
    flags.isStudentRewardsWorkspaceEnabled = true;
  }
  if (context.features.includes('STUDENT_GOALS_WORKSPACE') || context.features.includes('BETA_STUDENT_WORKSPACE')) {
    flags.isStudentGoalsWorkspaceEnabled = true;
  }
  if (context.features.includes('STUDENT_GRADES_WORKSPACE') || context.features.includes('BETA_STUDENT_WORKSPACE')) {
    flags.isStudentGradesWorkspaceEnabled = true;
  }
  if (context.features.includes('STUDENT_PROGRESS_WORKSPACE') || context.features.includes('BETA_STUDENT_WORKSPACE')) {
    flags.isStudentProgressWorkspaceEnabled = true;
  }
  if (context.features.includes('STUDENT_ASSIGNMENT_QUEUE') || context.features.includes('BETA_STUDENT_WORKSPACE')) {
    flags.isStudentAssignmentQueueEnabled = true;
  }

  // 3. Role/Persona Logic
  if (context.authority === 'student') {
      flags.isInventoryEnabled = false; // Strictly enforced override
  }

  if (context.authority === 'guardian' || context.authority === 'parent') {
    flags.isGuardianWorkspaceEnabled = true;
  }

  // 4. Remote Level (Global Configs) - HIGHEST PRIORITY Overrides
  if (globalConfigs['KILL_SWITCH_OCR'] === 'true' || globalConfigs['KILL_SWITCH_OCR'] === true) {
    flags.canUseOCR = false;
  }

  if (globalConfigs['MAINTENANCE_MODE'] === 'true' || globalConfigs['MAINTENANCE_MODE'] === true) {
    flags.isUnderMaintenance = true;
    // Potentially disable features here
  }

  // 5. User Specific Override (Flag Injection from Context)
  // This allows us to push a specific flag to a specific user via the flags map in UserContext
  if (context.flags) {
    Object.keys(context.flags).forEach(key => {
        if (key in flags) {
            (flags as any)[key] = context.flags[key];
        }
    });
  }

  return flags;
};
