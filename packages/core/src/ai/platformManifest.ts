import type { AIContextDomain } from '../types/aiContext';

/**
 * Sphere 1: Developmental Age & Persona Band
 * Governs vocabulary complexity, sentence length, Socratic scaffolding, and safe-search strictness.
 */
export type AgePedagogyBand =
  | 'early_years_6_9'
  | 'middle_years_10_13'
  | 'adolescent_14_18'
  | 'adult_educator'
  | 'adult_leader'
  | 'adult_guardian';

export interface AgePedagogyProfile {
  band: AgePedagogyBand;
  label: string;
  gradeRange: string;
  maxSentenceTarget: number;
  toneGuidance: string;
  pedagogyInstruction: string;
  safeSearchStrict: boolean;
}

export interface CompanionMemoryItem {
  id: string;
  category: 'preference' | 'goal' | 'subject' | 'context';
  fact: string;
  updatedAt?: string;
}

export interface UserPersonaOverview {
  role?: string;
  ageBand?: AgePedagogyBand;
  gradeLevel?: number;
  preferredLanguage?: 'en' | 'si' | 'ta';
  schoolName?: string;
  companionMemories?: CompanionMemoryItem[];
}

export const AGE_PEDAGOGY_PROFILES: Record<AgePedagogyBand, AgePedagogyProfile> = {
  early_years_6_9: {
    band: 'early_years_6_9',
    label: 'Young Explorer (Ages 6–9 / Grades 1–4)',
    gradeRange: 'Grades 1–4',
    maxSentenceTarget: 3,
    toneGuidance:
      'Speak with gentle wonder, warmth, and playful curiosity. Use simple everyday words and concrete nature or story analogies.',
    pedagogyInstruction:
      'Break every idea into one tiny, concrete step at a time. Never overwhelm with abstract jargon. Celebrate curiosity and ask a simple, friendly question to help them notice the answer.',
    safeSearchStrict: true,
  },
  middle_years_10_13: {
    band: 'middle_years_10_13',
    label: 'Middle Years Learner (Ages 10–13 / Grades 5–8)',
    gradeRange: 'Grades 5–8',
    maxSentenceTarget: 4,
    toneGuidance:
      'Speak with encouraging clarity and relatable curiosity. Connect school concepts to how things work in the real world.',
    pedagogyInstruction:
      'Guide discovery by connecting "why" and "how". Give a clear example or analogy first, then invite them to try the next step before showing a full formula or solution.',
    safeSearchStrict: true,
  },
  adolescent_14_18: {
    band: 'adolescent_14_18',
    label: 'Senior Scholar (Ages 14–18 / Grades 9–13 O/L & A/L)',
    gradeRange: 'Grades 9–13 (O/L & A/L)',
    maxSentenceTarget: 5,
    toneGuidance:
      'Speak with intellectual respect, calm clarity, and academic rigor. Treat them as a capable young thinker preparing for O/L or A/L mastery and life beyond school.',
    pedagogyInstruction:
      'Use accurate subject terminology, structured reasoning, and syllabus-aware breakdowns. Scaffold problem-solving through method and first principles rather than handing over copy-paste answers.',
    safeSearchStrict: true,
  },
  adult_educator: {
    band: 'adult_educator',
    label: 'Educator & Mentor (Teacher / Section / Grade Head)',
    gradeRange: 'Educator',
    maxSentenceTarget: 6,
    toneGuidance:
      'Speak as a thoughtful, peer-to-peer professional colleague who honours the craft of teaching and protects the teacher from administrative drudgery.',
    pedagogyInstruction:
      'Offer practical, classroom-ready lesson structures, differentiated rubrics, and nurturing student intervention ideas. Never use deficit labels or rank students punitively.',
    safeSearchStrict: false,
  },
  adult_leader: {
    band: 'adult_leader',
    label: 'School & Sanctuary Steward (Principal / Founder / Admin)',
    gradeRange: 'Leadership',
    maxSentenceTarget: 6,
    toneGuidance:
      'Speak with calm, ecological systems-thinking. Help leadership see both the whole school forest and the human wellbeing of each teacher and student.',
    pedagogyInstruction:
      'Synthesize operational flows, coverage gaps, and institutional rhythms clearly while upholding the Sanctuary Soul Covenant (personal wellbeing data is never used for surveillance).',
    safeSearchStrict: false,
  },
  adult_guardian: {
    band: 'adult_guardian',
    label: 'Family & Guardian Partner (Parent / Guardian)',
    gradeRange: 'Family Partner',
    maxSentenceTarget: 5,
    toneGuidance:
      'Speak as a warm, reassuring family partner. Translate school learning and progress into supportive, low-anxiety conversations at home.',
    pedagogyInstruction:
      'Focus on the child’s holistic growth, curiosity, and steady habits rather than comparative rankings or exam pressure.',
    safeSearchStrict: true,
  },
};

/**
 * Resolves the appropriate Age/Persona Pedagogy Profile from explicit band, grade level, or role/capacity.
 */
export function resolveAgePedagogyProfile(
  role?: string,
  explicitBand?: AgePedagogyBand,
  gradeLevel?: number,
): AgePedagogyProfile {
  if (explicitBand && AGE_PEDAGOGY_PROFILES[explicitBand]) {
    return AGE_PEDAGOGY_PROFILES[explicitBand];
  }

  const normalizedRole = (role ?? 'teacher').toLowerCase().trim();

  if (normalizedRole === 'student') {
    if (typeof gradeLevel === 'number') {
      if (gradeLevel <= 4) return AGE_PEDAGOGY_PROFILES.early_years_6_9;
      if (gradeLevel <= 8) return AGE_PEDAGOGY_PROFILES.middle_years_10_13;
      return AGE_PEDAGOGY_PROFILES.adolescent_14_18;
    }
    return AGE_PEDAGOGY_PROFILES.adolescent_14_18;
  }

  if (normalizedRole === 'parent' || normalizedRole === 'guardian') {
    return AGE_PEDAGOGY_PROFILES.adult_guardian;
  }

  if (
    normalizedRole === 'principal' ||
    normalizedRole === 'assistant_principal' ||
    normalizedRole === 'founder' ||
    normalizedRole === 'admin'
  ) {
    return AGE_PEDAGOGY_PROFILES.adult_leader;
  }

  return AGE_PEDAGOGY_PROFILES.adult_educator;
}

const SACRED_MEMORY_BLOCK_PATTERNS = [
  /fire[_\s-]?journal/i,
  /voice[_\s-]?journal/i,
  /safeguarding/i,
  /password|secret[_\s-]?key|access[_\s-]?token/i,
];

/**
 * Sanitizes opt-in longitudinal companion memory items so sacred private data is never injected.
 */
export function sanitizeCompanionMemories(memories?: CompanionMemoryItem[]): CompanionMemoryItem[] {
  if (!Array.isArray(memories)) return [];
  return memories
    .filter((item) => {
      if (!item || typeof item.fact !== 'string') return false;
      const trimmed = item.fact.trim();
      if (trimmed.length === 0) return false;
      return !SACRED_MEMORY_BLOCK_PATTERNS.some((pattern) => pattern.test(trimmed));
    })
    .slice(0, 8)
    .map((item) => ({
      id: String(item.id || 'mem').slice(0, 64),
      category: item.category ?? 'context',
      fact: item.fact.trim().slice(0, 200),
      updatedAt: item.updatedAt,
    }));
}

/**
 * Sphere 2: Platform Self-Awareness Manifest
 * Gives the AI Companion grounded knowledge of what Gurudevi is, its 4 Sanctuary Places,
 * available tools, and deep-link navigation routes.
 */
export interface PlatformPlaceCapability {
  id: string;
  domain: AIContextDomain | 'ai';
  title: string;
  route: string;
  summary: string;
  keyFeatures: string[];
  allowedRoles: Array<'student' | 'teacher' | 'principal' | 'guardian' | 'founder' | 'all'>;
}

export const PLATFORM_CAPABILITY_MANIFEST: PlatformPlaceCapability[] = [
  {
    id: 'place.self',
    domain: 'self',
    title: 'Self (Sadhana — Personal Wellbeing & Inner Practice)',
    route: '/(tabs)',
    summary:
      'A person-owned sanctuary for daily rhythm, mindful breathing, personal goals/reminders, study focus, and private reflection.',
    keyFeatures: [
      'Goals & Reminders (Today checklist and personal intentions)',
      'Study Rhythm & Focus Timer (Pomodoro/flow sessions and mindful minutes)',
      'Tomorrow Prep & Thought Reframe (structured reflection cards)',
      'Banyan Growth Tree & Orientation Seeds (personal learning tendencies)',
      'Sacred Boundary: Fire Journal (Let It Burn) and Voice Journal are 100% private and never read by AI or institutions.',
    ],
    allowedRoles: ['all'],
  },
  {
    id: 'place.workspace',
    domain: 'workspace',
    title: 'Workspace (Classroom, Teaching & School Operations)',
    route: '/(tabs)/workspace',
    summary:
      'Role-adaptive workspace for classroom attendance, gradebooks, lesson planning, timetable healing, and durable agent mission review.',
    keyFeatures: [
      'Attendance & Daily Session Tracking (one-tap register and gap alerts)',
      'Gradebook, Assessments & Mark Publication (with guardian visibility controls)',
      'Lesson Planner, Curriculum Units & Resource Attachment',
      'Timetable Scheduler & Substitution Repair',
      'Durable Agent Missions (quarantined teacher-summary and student-support drafts requiring human approval)',
    ],
    allowedRoles: ['teacher', 'principal', 'founder', 'student', 'guardian'],
  },
  {
    id: 'place.library',
    domain: 'library',
    title: 'Library (Epistemic Commons & Knowledge Atlas)',
    route: '/(tabs)/library',
    summary:
      'Curated educational books, Sri Lankan syllabus resources, past papers, interactive concept mapping, and the School Forest nature atlas.',
    keyFeatures: [
      'Curated Books, Notes, Videos & Past Papers filtered by subject and grade',
      'Concept Mapping & Knowledge Topology exploration',
      'School Forest & Nature Paths (ecological literacy and biodiversity atlas)',
      'Contextual AI Study Companion (explain selected resource, quiz me, or connect to syllabus)',
    ],
    allowedRoles: ['all'],
  },
  {
    id: 'place.community',
    domain: 'community',
    title: 'Community (Relational Fabric, Circles & Direct Messages)',
    route: '/(tabs)/community',
    summary:
      'School-wide and peer learning circles, announcements, collaborative discussions, and Direct Messages including the pinned AI Mentor thread.',
    keyFeatures: [
      'Learning Circles & Subject Study Groups',
      'School Feed, Celebrations & Notices',
      'Direct Messages (`/(tabs)/community` -> Messages) with a pinned Persistent AI Mentor thread (`/a-i-assistant?threadId=mentor-dm`)',
    ],
    allowedRoles: ['all'],
  },
  {
    id: 'place.ai_companion',
    domain: 'ai',
    title: 'Sanctuary AI Companion & Agent Studio (`AIScreen`)',
    route: '/a-i-assistant',
    summary:
      'Accessible from the global Lotus Petal FAB on any screen or via the Community AI pill. Supports Contextual Chat, Rewind Thread History, Incognito Mode, Sandboxed MCP Data Lookup, Durable Agent Drafts, and Safe World Search.',
    keyFeatures: [
      'Context Pill with 1-tap [Detach / Attach] control over screen context',
      'Thread History Rewind & Privacy Modes (Saved, 30-day Temporary, Zero-Trace Incognito)',
      'Sandboxed MCP Read Tools & Quarantined Agent Proposal Drafts (human-in-the-loop promotion)',
      'Safe Educational World Search & Grounding with citations',
    ],
    allowedRoles: ['all'],
  },
];

/**
 * Builds a compact, high-signal Platform Self-Awareness prompt section (~220 tokens)
 * tailored to the user's role and active Sanctuary place.
 */
export function buildPlatformAwarenessPrompt(role?: string, activeDomain?: string): string {
  const normalizedRole = (role ?? 'teacher').toLowerCase().trim();
  const lines = PLATFORM_CAPABILITY_MANIFEST.map((place) => {
    const isCurrent = activeDomain && place.domain === activeDomain.toLowerCase();
    const marker = isCurrent ? ' (USER IS CURRENTLY HERE)' : '';
    return `- ${place.title} [Route: ${place.route}]${marker}: ${place.summary} Key features: ${place.keyFeatures.slice(0, 3).join('; ')}.`;
  });

  return [
    'PLATFORM SELF-AWARENESS (WHAT GURUDEVI IS & CAN DO):',
    'Gurudevi is a convivial, offline-first Sanctuary platform organized into four main Places plus this AI Companion:',
    ...lines,
    `When a ${normalizedRole} asks how to do something in Gurudevi or where a feature lives, guide them clearly to the right Place and feature. Never invent non-existent menus; respect that any database change requires their explicit approval.`,
  ].join('\n');
}
