import {
  classifyCustomTrapSlope,
  filterTrapsBySlope,
  findTrapById,
  resolveTraps as resolveTrapsFrom,
} from '@repo/core/logic/reflection';
import type { ThinkingTrap, TrapSlope } from '@repo/self/types';

/**
 * Thinking-trap catalog for the Reframe feature.
 *
 * Concepts are the classic cognitive-distortion families from the public CBT
 * literature; the labels, descriptions, examples, and challenge prompts are
 * authored fresh for the Gurudevi audience (students + teachers). No code or
 * copy is taken from reference apps. See
 * docs/decisions/2026-08-27-gpl-reference-project-clean-room-strategy.md.
 *
 * The catalog lookup helpers are shared with @repo/classroom via the engine in
 * @repo/core/logic/reflection — this module owns only the authored content and
 * the domain-facing API.
 */

export const TRAP_CATALOG: ThinkingTrap[] = [
  {
    id: 'all_or_nothing',
    label: 'Everything-or-nothing',
    emoji: '⚪⚫',
    slope: 'general',
    description: 'Seeing situations in only two colors: full success or total failure.',
    example: 'I got three As and one B, so the term is ruined.',
    challengePrompt: 'Is there a middle grade between perfect and failed?',
  },
  {
    id: 'overgeneralization',
    label: 'One event, one rule',
    emoji: '🧩',
    slope: 'general',
    description: 'Turning a single event into a forever rule.',
    example: 'I blanked in that quiz once, so I always choke in tests.',
    challengePrompt: 'Does one example really make an always?',
  },
  {
    id: 'mental_filter',
    label: 'Spotlight on the bad',
    emoji: '🔦',
    slope: 'general',
    description: 'Zooming in on the one miss and ignoring everything that went well.',
    example: 'The teacher praised my opening and only flagged one page, but I only hear the flag.',
    challengePrompt: 'What did I get right that I am not counting?',
  },
  {
    id: 'discounting_positive',
    label: 'Erasing the good',
    emoji: '🧽',
    slope: 'general',
    description: 'Dismissing praise or wins as luck, not evidence.',
    example: 'They only said my essay was strong because they are being kind.',
    challengePrompt: 'If a friend did this, would I call it luck too?',
  },
  {
    id: 'mind_reading',
    label: 'Mind reading',
    emoji: '🔮',
    slope: 'general',
    description: 'Assuming you know what another person is thinking without asking.',
    example: 'She is quiet today, so she must be disappointed in me.',
    challengePrompt: 'Do I actually know, or am I guessing? Can I check?',
  },
  {
    id: 'fortune_telling',
    label: 'Fortune telling',
    emoji: '🔎',
    slope: 'general',
    description: 'Deciding how things will end before they begin.',
    example: 'No point rehearsing the presentation; I will stumble anyway.',
    challengePrompt: 'How many predicted disasters actually came true?',
  },
  {
    id: 'catastrophizing',
    label: 'Worst-case lens',
    emoji: '🌋',
    slope: 'general',
    description: 'Jumping straight to the most extreme outcome.',
    example: 'If I miss this deadline, the whole term collapses.',
    challengePrompt: 'What is the most likely outcome, not just the most dramatic?',
  },
  {
    id: 'emotional_reasoning',
    label: 'Feeling is fact',
    emoji: '🎭',
    slope: 'general',
    description: 'Treating a feeling as proof that the thought behind it is true.',
    example: 'I feel unprepared, therefore the exam will go badly.',
    challengePrompt: 'What evidence exists beyond how I feel right now?',
  },
  {
    id: 'should_statements',
    label: 'Shoulding',
    emoji: '📏',
    slope: 'general',
    description: 'Pushing yourself (or others) with harsh rules set to "must".',
    example: 'I should have known this already without anyone teaching me.',
    challengePrompt: 'Is this a rule I chose, or a demand I copied?',
  },
  {
    id: 'labeling',
    label: 'Labels over facts',
    emoji: '🏷️',
    slope: 'general',
    description: 'Using one label that flattens a whole person or moment.',
    example: 'I messed up the experiment, so I am just careless.',
    challengePrompt: 'What did I actually do, separate from the label?',
  },
  {
    id: 'personalization',
    label: 'Making it personal',
    emoji: '🪞',
    slope: 'general',
    description: 'Taking blame or meaning for things that are not about you.',
    example: 'The class was distracted today, so I must be a boring teacher.',
    challengePrompt: 'Which factors outside me could explain this too?',
  },
  {
    id: 'magnification',
    label: 'Blowing up the blip',
    emoji: '🔍',
    slope: 'general',
    description: 'Making a small slip feel enormous and central.',
    example: 'I gave one wrong figure in assembly and now everyone will remember it forever.',
    challengePrompt: 'How much will this matter in a week or a month?',
  },
  {
    id: 'fixed_mindset',
    label: 'I just cannot',
    emoji: '🧱',
    slope: 'learning',
    description: 'Treating an ability as fixed instead of something practice can grow.',
    example: 'I am not a math person, so working harder will not help.',
    challengePrompt: 'What is the smallest step I have not yet tried?',
  },
  {
    id: 'academic_catastrophizing',
    label: 'One grade sank my term',
    emoji: '📉',
    slope: 'learning',
    description: 'Judging a whole term, subject, or ability from a single mark.',
    example: 'This C means the subject and my whole semester are a wash.',
    challengePrompt: 'What does this grade say I can still do well?',
  },
  {
    id: 'procrastination_forecasting',
    label: 'Later, who knows',
    emoji: '⏭️',
    slope: 'learning',
    description: 'Assuming future-you will happily do the work future-you is dreading.',
    example: 'I will study properly the night before, like always.',
    challengePrompt: 'If past predictions were unreliable, what would a tiny step now cost?',
  },
  {
    id: 'surface_learning',
    label: 'Memorizing is understanding',
    emoji: '📚',
    slope: 'learning',
    description: 'Confusing being able to repeat something with being able to use it.',
    example: 'I can recite the definition, so I am ready to apply it in problems.',
    challengePrompt: 'Can I explain it in my own words to a classmate?',
  },
  {
    id: 'comparison_trap',
    label: 'Everyone is ahead',
    emoji: '👀',
    slope: 'learning',
    description: 'Measuring your start against someone elses middle.',
    example: 'They already finished and posted it; I am still on the first step.',
    challengePrompt: 'Compared with yesterday-me, am I moving?',
  },
  {
    id: 'perfection_stall',
    label: 'Wait for perfect',
    emoji: '💎',
    slope: 'learning',
    description: 'Refusing to submit anything that is not flawless, so nothing ships.',
    example: 'This draft is not good enough to show, so I will keep it to myself.',
    challengePrompt: 'What would a good-enough version let me learn sooner?',
  },
];

/** Resolve a trap by id within the Reframe catalog. */
export function getTrapById(id: string): ThinkingTrap | undefined {
  return findTrapById(TRAP_CATALOG, id);
}

/** Filter the Reframe catalog to a single slope. */
export function getTrapsBySlope(slope: TrapSlope): ThinkingTrap[] {
  return filterTrapsBySlope(TRAP_CATALOG, slope);
}

/**
 * Resolve trap ids against the Reframe catalog, ignoring unknowns, and append
 * a user-defined trap when custom text is given.
 */
export function resolveTraps(trapIds: string[], customTrap?: string): ThinkingTrap[] {
  const built = customTrap?.trim() ? buildCustomTrap(customTrap.trim()) : undefined;
  return resolveTrapsFrom(TRAP_CATALOG, trapIds, built);
}

function buildCustomTrap(text: string): ThinkingTrap {
  return {
    id: 'custom',
    label: text,
    emoji: '✍️',
    slope: classifyCustomTrapSlope(text),
    description: 'Your own described thinking pattern.',
    example: '',
    challengePrompt: 'What would a teacher you respect say about this?',
  };
}
