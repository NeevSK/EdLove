import { type AiProvider } from '../ports/BillingPort';
import { type BillingPort } from '../ports/BillingPort';
import { type LlmPort } from '../ports/LlmPort';

interface ActiveGap {
  type: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  suggestedAction: string;
}

interface RequestContext {
  role?: string;
  schoolName?: string;
  activeGaps?: ActiveGap[];
  orientationSeeds?: {
    depth_breadth: number;
    reflect_act: number;
    solo_social: number;
    steady_surge: number;
  } | null;
  moonPhase?: string;
  byokKey?: string;
  billingMode?: 'baseline' | 'byok' | 'purchased';
  schoolId?: string;
}

export class Orchestrator {
  constructor(
    private billingPort: BillingPort,
    private getLlmAdapter: (provider: AiProvider) => LlmPort,
  ) {}

  async processChat(
    userId: string,
    message: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    context: RequestContext,
  ): Promise<any> {
    // 1. Resolve Billing Tiers & API Keys & Provider
    const billing = await this.billingPort.resolveBilling(
      userId,
      context.billingMode ?? 'baseline',
      {
        byokKeyInput: context.byokKey,
        schoolId: context.schoolId,
        preferredProvider:
          context.billingMode === 'byok' ? undefined : (context.billingMode as any), // pass preference
      },
    );

    if (!billing.apiKey) {
      throw new Error(`Model API key not configured for billing mode: ${billing.mode}`);
    }

    // 2. Build the System Prompt (Voice Enforcement)
    const systemPrompt = this.buildSystemPrompt(context);

    // 3. Resolve LLM Adapter dynamically and trigger call
    try {
      const llmAdapter = this.getLlmAdapter(billing.provider);
      return await llmAdapter.streamChat(systemPrompt, history, billing.apiKey, billing.model);
    } catch (err) {
      console.warn(
        `[Orchestrator] Primary provider ${billing.provider} failed, evaluating fallback chain...`,
        err,
      );

      // Only execute fallback chain for platform-seeded tiers to prevent cost leakage on user keys
      if (billing.mode !== 'byok') {
        const fallbacks: Array<{
          provider: AiProvider;
          key?: string;
          model: string;
        }> = [
          { provider: 'openai', key: process.env.OPENAI_API_KEY, model: 'gpt-4o' },
          {
            provider: 'anthropic',
            key: process.env.ANTHROPIC_API_KEY,
            model: 'claude-3-5-sonnet-20241022',
          },
          { provider: 'gemini', key: process.env.GEMINI_API_KEY, model: 'gemini-1.5-pro' },
          {
            provider: 'openrouter',
            key: process.env.OPENROUTER_API_KEY,
            model: process.env.OPENROUTER_MODEL || 'openrouter/auto',
          },
        ];

        for (const fallback of fallbacks) {
          if (fallback.provider !== billing.provider && fallback.key) {
            try {
              console.log(
                `[Orchestrator] Initiating fallback failover to ${fallback.provider} (${fallback.model})...`,
              );
              const fallbackAdapter = this.getLlmAdapter(fallback.provider);
              return await fallbackAdapter.streamChat(
                systemPrompt,
                history,
                fallback.key,
                fallback.model,
              );
            } catch (fallbackErr) {
              console.warn(`[Orchestrator] Fallback to ${fallback.provider} failed:`, fallbackErr);
            }
          }
        }
      }
      throw err;
    }
  }

  private buildSystemPrompt(context: RequestContext = {}): string {
    const role = context.role ?? 'teacher';
    const school = context.schoolName ? ` at ${context.schoolName}` : '';
    const gaps = context.activeGaps ?? [];
    const seeds = context.orientationSeeds;
    const moon = context.moonPhase;

    // Core persona — always present
    const core = `You are the Sanctuary Guide of Gurudevi — a wellbeing-centered school platform used by Sri Lankan educators, students, and school leaders.

You are a thoughtful, warm, and grounded companion. You speak to the whole person, not just the professional. You follow the Socratic tradition: you ask good questions, reflect meaningfully, and never lecture.

The person you are speaking with is a ${role}${school}.`;

    // Role-specific framing
    const roleContext = (() => {
      switch (role) {
        case 'teacher':
          return `
As a teacher, their world balances lesson preparation, student relationships, wellbeing, and the sometimes-heavy weight of institutional demands. They may need practical help (curriculum, attendance, gradebook), emotional reflection (energy, stress, meaning), or creative thinking (new approaches, lesson ideas).`;
        case 'principal':
          return `
As a principal, they hold the wellbeing of their entire school in their hands. They may be thinking about staff morale, school improvement, resource gaps, or their own leadership journey. They see the forest — help them see each tree too.`;
        case 'student':
          return `
As a student, they are on a learning journey. They may need help understanding concepts, managing study stress, setting goals, or finding meaning in what they are learning. Meet them with curiosity and gentleness.`;
        case 'founder':
          return `
As a founder, they hold vision across many schools. They think in ecosystems and patterns. They may be wrestling with strategy, scale, educational philosophy, or the tension between what is and what could be.`;
        default:
          return '';
      }
    })();

    // Orientation seeds — silent personalisation
    let orientationContext = '';
    if (seeds) {
      const tendencies: string[] = [];
      if (seeds.depth_breadth > 70) tendencies.push('prefers depth over breadth');
      else if (seeds.depth_breadth < 30) tendencies.push('enjoys exploring widely');
      if (seeds.reflect_act > 70) tendencies.push('tends to reflect before acting');
      else if (seeds.reflect_act < 30) tendencies.push('is action-oriented');
      if (seeds.solo_social > 70) tendencies.push('works better alone');
      else if (seeds.solo_social < 30) tendencies.push('draws energy from collaboration');
      if (seeds.steady_surge > 70) tendencies.push('values steady consistent rhythms');
      else if (seeds.steady_surge < 30) tendencies.push('works in energetic bursts');

      if (tendencies.length > 0) {
        orientationContext = `\nBased on their learning orientation, this person ${tendencies.join(', ')}. Adjust your communication style accordingly — but never mention these tendencies explicitly.`;
      }
    }

    // Moon phase context
    let moonContext = '';
    if (moon) {
      const moonGuide: Record<string, string> = {
        new_moon:
          'This is a new moon phase — a time for new intentions, planting seeds, beginning. Honour that energy in your responses.',
        waxing_crescent:
          'The moon is waxing — energy is building. Good for action, plans, and momentum.',
        first_quarter:
          'The first quarter moon — decision and commitment. Support the person in clarifying what they are building.',
        waxing_gibbous:
          'Almost full — refinement and preparation. Help them refine and strengthen what they have been building.',
        full_moon:
          'Full moon — illumination and completion. Help them see clearly what has been accomplished and what needs releasing.',
        waning_gibbous:
          'The moon is waning — reflection and gratitude. This is a time to honour what has been done.',
        last_quarter:
          'Last quarter — release and forgiveness. Help them let go of what no longer serves.',
        waning_crescent:
          'Waning crescent — rest and restoration. This is the quietest phase. Honour the need for stillness.',
      };
      const moonNote = moonGuide[moon.toLowerCase().replace(' ', '_')];
      if (moonNote) moonContext = `\n${moonNote}`;
    }

    // Active gaps — urgent operational context
    let gapsContext = '';
    if (gaps.length > 0) {
      const highGaps = gaps.filter((g) => g.priority === 'high');
      if (highGaps.length > 0) {
        gapsContext =
          `\nThere are currently ${highGaps.length} high-priority items in their school flow:\n` +
          highGaps.map((g) => `  - ${g.title} → ${g.suggestedAction}`).join('\n') +
          '\nYou may gently mention these if the conversation touches on school operations, but never be pushy.';
      }
    }

    // Behaviour rules — always at the end
    const rules = `

RULES:
- Always respond in the same language the user writes in (English, Sinhala, or Tamil).
- Never lecture. Ask one clear, thoughtful question when you want to deepen reflection.
- Be warm, specific, and grounded. Avoid generic affirmations like "That's great!"
- Keep responses concise — 2–4 sentences is ideal. Go longer only when a longer answer is genuinely needed.
- If you don't know something specific about Sri Lankan education, ask rather than assume.
- You are not a therapist. For serious mental health concerns, gently suggest professional support.
- Never mention the orientation seeds or growth model explicitly.`;

    return core + roleContext + orientationContext + moonContext + gapsContext + rules;
  }
}
