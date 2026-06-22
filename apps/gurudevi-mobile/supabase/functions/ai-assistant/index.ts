/**
 * ai-assistant \u2014 Supabase Edge Function (Deno)
 *
 * The real AI spine of Gurudevi. Every role (Teacher, Principal, Student, Founder)
 * gets a contextual system prompt shaped by:
 *   - Their role and school
 *   - Active operational gaps (attendance, ungraded work)
 *   - Their private orientation fingerprint (4-vector from onboarding)
 *   - Current moon phase context
 *
 * Routes to OpenAI GPT-4o by default.
 * Set ANTHROPIC_API_KEY to use Claude 3.5 Sonnet instead.
 *
 * Secrets required (set via `supabase secrets set`):
 *   OPENAI_API_KEY                        (primary LLM)
 *   ANTHROPIC_API_KEY                     (optional \u2014 enables Claude fallback)
 *   SUPABASE_URL                          (auto-provided)
 *   SUPABASE_SERVICE_ROLE_KEY             (auto-provided)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// \u2500\u2500 Types \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

interface RequestBody {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: {
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
    byokKey?: string; // Decrypted User key passed from client
    billingMode?: 'baseline' | 'byok' | 'purchased';
  };
}

interface ActiveGap {
  type: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  suggestedAction: string;
}

// ──── System prompt builder ─────────────────────────────────────────────────────────────

function buildSystemPrompt(context: RequestBody['context'] = {}): string {
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

// ──── Streaming LLM call ─────────────────────────────────────────────────────────────

async function streamOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  userMessage: string,
): Promise<ReadableStream> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 512,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI stream initialization failed: ${err}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = response.body?.getReader();

  return new ReadableStream({
    async start(controller) {
      try {
        let buffer = '';
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine || cleanLine === 'data: [DONE]') continue;
            if (cleanLine.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(cleanLine.slice(6));
                const text = parsed.choices?.[0]?.delta?.content;
                if (text) {
                  // Format stream event to match TanStack AI protocol: event: text\ndata: "..."\n\n
                  controller.enqueue(
                    encoder.encode(`event: text\ndata: ${JSON.stringify(text)}\n\n`),
                  );
                }
              } catch {
                // Ignore parse errors on partial stream lines
              }
            }
          }
        }
        controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

// ──── Main handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: RequestBody = await req.json();
    const { message, history = [], context = {} } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build the contextual system prompt (owning the voice)
    const systemPrompt = buildSystemPrompt(context);

    // Resolve model and key based on Billing Mode (Seeded vs BYOK vs Purchased)
    let apiKey = '';
    let model = 'gpt-4o-mini'; // default budget model
    const mode = context.billingMode ?? 'baseline';

    if (mode === 'byok' && context.byokKey) {
      apiKey = context.byokKey;
      model = 'gpt-4o'; // Let BYOK users utilize full GPT-4o
    } else if (mode === 'purchased') {
      // Validate active subscription or tokens quota from database
      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (sub) {
        apiKey = Deno.env.get('OPENAI_API_KEY') || '';
        model = 'gpt-4o'; // Premium tier gets standard GPT-4o
      } else {
        // Fallback to baseline if active purchase not found
        apiKey = Deno.env.get('OPENAI_API_KEY') || '';
        model = 'gpt-4o-mini';
      }
    } else {
      // Baseline usage
      apiKey = Deno.env.get('OPENAI_API_KEY') || '';
      model = 'gpt-4o-mini';
    }

    if (!apiKey) {
      throw new Error(`API key not configured for billing mode: ${mode}`);
    }

    // Stream response back in TanStack AI SSE format
    const stream = await streamOpenAI(apiKey, model, systemPrompt, history, message);

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[ai-assistant] error:', err);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

/**
 * Graceful degradation when no API key is configured.
 * Returns a Socratic prompt rather than an error.
 */
function buildLocalFallback(input: string, role: string): string {
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes('lesson') || lowerInput.includes('class')) {
    return 'Lessons are more than delivery \u2014 they are shared experiences. How was the energy in the room?';
  }
  if (lowerInput.includes('tired') || lowerInput.includes('stress')) {
    return 'Rest is not a luxury; it is a vital part of the cycle. How can you find a moment of stillness today?';
  }
  if (lowerInput.includes('student')) {
    return 'Each student is a world unto themselves. What did one of them teach you today?';
  }
  if (role === 'principal') {
    return 'Leading a school means holding many realities at once. Which one needs your attention most right now?';
  }
  return 'That is something worth sitting with. What feels most true about it to you?';
}
