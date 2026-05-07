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

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type",
};

// \u2500\u2500 Types \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

interface RequestBody {
	message: string;
	history?: Array<{ role: "user" | "assistant"; content: string }>;
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
	};
}

interface ActiveGap {
	type: string;
	title: string;
	priority: "low" | "medium" | "high";
	suggestedAction: string;
}

// \u2500\u2500 System prompt builder \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function buildSystemPrompt(context: RequestBody["context"] = {}): string {
	const role = context.role ?? "teacher";
	const school = context.schoolName ? ` at ${context.schoolName}` : "";
	const gaps = context.activeGaps ?? [];
	const seeds = context.orientationSeeds;
	const moon = context.moonPhase;

	// Core persona \u2014 always present
	const core = `You are the Sanctuary Guide of Gurudevi \u2014 a wellbeing-centered school platform used by Sri Lankan educators, students, and school leaders.

You are a thoughtful, warm, and grounded companion. You speak to the whole person, not just the professional. You follow the Socratic tradition: you ask good questions, reflect meaningfully, and never lecture.

The person you are speaking with is a ${role}${school}.`;

	// Role-specific framing
	const roleContext = (() => {
		switch (role) {
			case "teacher":
				return `
As a teacher, their world balances lesson preparation, student relationships, wellbeing, and the sometimes-heavy weight of institutional demands. They may need practical help (curriculum, attendance, gradebook), emotional reflection (energy, stress, meaning), or creative thinking (new approaches, lesson ideas).`;
			case "principal":
				return `
As a principal, they hold the wellbeing of their entire school in their hands. They may be thinking about staff morale, school improvement, resource gaps, or their own leadership journey. They see the forest \u2014 help them see each tree too.`;
			case "student":
				return `
As a student, they are on a learning journey. They may need help understanding concepts, managing study stress, setting goals, or finding meaning in what they are learning. Meet them with curiosity and gentleness.`;
			case "founder":
				return `
As a founder, they hold vision across many schools. They think in ecosystems and patterns. They may be wrestling with strategy, scale, educational philosophy, or the tension between what is and what could be.`;
			default:
				return "";
		}
	})();

	// Orientation seeds \u2014 silent personalisation
	let orientationContext = "";
	if (seeds) {
		const tendencies: string[] = [];
		if (seeds.depth_breadth > 70) tendencies.push("prefers depth over breadth");
		else if (seeds.depth_breadth < 30)
			tendencies.push("enjoys exploring widely");
		if (seeds.reflect_act > 70)
			tendencies.push("tends to reflect before acting");
		else if (seeds.reflect_act < 30) tendencies.push("is action-oriented");
		if (seeds.solo_social > 70) tendencies.push("works better alone");
		else if (seeds.solo_social < 30)
			tendencies.push("draws energy from collaboration");
		if (seeds.steady_surge > 70)
			tendencies.push("values steady consistent rhythms");
		else if (seeds.steady_surge < 30)
			tendencies.push("works in energetic bursts");

		if (tendencies.length > 0) {
			orientationContext = `\nBased on their learning orientation, this person ${tendencies.join(", ")}. Adjust your communication style accordingly \u2014 but never mention these tendencies explicitly.`;
		}
	}

	// Moon phase context
	let moonContext = "";
	if (moon) {
		const moonGuide: Record<string, string> = {
			new_moon:
				"This is a new moon phase \u2014 a time for new intentions, planting seeds, beginning. Honour that energy in your responses.",
			waxing_crescent:
				"The moon is waxing \u2014 energy is building. Good for action, plans, and momentum.",
			first_quarter:
				"The first quarter moon \u2014 decision and commitment. Support the person in clarifying what they are building.",
			waxing_gibbous:
				"Almost full \u2014 refinement and preparation. Help them refine and strengthen what they have been building.",
			full_moon:
				"Full moon \u2014 illumination and completion. Help them see clearly what has been accomplished and what needs releasing.",
			waning_gibbous:
				"The moon is waning \u2014 reflection and gratitude. This is a time to honour what has been done.",
			last_quarter:
				"Last quarter \u2014 release and forgiveness. Help them let go of what no longer serves.",
			waning_crescent:
				"Waning crescent \u2014 rest and restoration. This is the quietest phase. Honour the need for stillness.",
		};
		const moonNote = moonGuide[moon.toLowerCase().replace(" ", "_")];
		if (moonNote) moonContext = `\n${moonNote}`;
	}

	// Active gaps \u2014 urgent operational context
	let gapsContext = "";
	if (gaps.length > 0) {
		const highGaps = gaps.filter((g) => g.priority === "high");
		if (highGaps.length > 0) {
			gapsContext =
				`\nThere are currently ${highGaps.length} high-priority items in their school flow:\n` +
				highGaps
					.map((g) => `  - ${g.title} \u2192 ${g.suggestedAction}`)
					.join("\n") +
				"\nYou may gently mention these if the conversation touches on school operations, but never be pushy.";
		}
	}

	// Behaviour rules \u2014 always at the end
	const rules = `

RULES:
- Always respond in the same language the user writes in (English, Sinhala, or Tamil).
- Never lecture. Ask one clear, thoughtful question when you want to deepen reflection.
- Be warm, specific, and grounded. Avoid generic affirmations like "That's great!"
- Keep responses concise \u2014 2\u20134 sentences is ideal. Go longer only when a longer answer is genuinely needed.
- If you don't know something specific about Sri Lankan education, ask rather than assume.
- You are not a therapist. For serious mental health concerns, gently suggest professional support.
- Never mention the orientation seeds or growth model explicitly.`;

	return (
		core + roleContext + orientationContext + moonContext + gapsContext + rules
	);
}

// \u2500\u2500 LLM call \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

async function callOpenAI(
	systemPrompt: string,
	history: Array<{ role: string; content: string }>,
	userMessage: string,
): Promise<string> {
	const apiKey = Deno.env.get("OPENAI_API_KEY");
	if (!apiKey) throw new Error("OPENAI_API_KEY not set");

	const messages = [
		{ role: "system", content: systemPrompt },
		...history.slice(-10), // keep last 10 turns for context window efficiency
		{ role: "user", content: userMessage },
	];

	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: "gpt-4o",
			messages,
			max_tokens: 512,
			temperature: 0.7,
		}),
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(`OpenAI error ${response.status}: ${err}`);
	}

	const data = await response.json();
	return data.choices?.[0]?.message?.content ?? "I am here. How can I help?";
}

async function callClaude(
	systemPrompt: string,
	history: Array<{ role: string; content: string }>,
	userMessage: string,
): Promise<string> {
	const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
	if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

	const messages = [
		...history.slice(-10),
		{ role: "user", content: userMessage },
	];

	const response = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: "claude-3-5-sonnet-20241022",
			system: systemPrompt,
			messages,
			max_tokens: 512,
		}),
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(`Anthropic error ${response.status}: ${err}`);
	}

	const data = await response.json();
	return data.content?.[0]?.text ?? "I am here. How can I help?";
}

// \u2500\u2500 Main handler \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

Deno.serve(async (req: Request) => {
	// CORS preflight
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		// Authenticate the caller
		const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
		const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
		const supabase = createClient(supabaseUrl, supabaseKey);

		const authHeader = req.headers.get("Authorization");
		if (!authHeader) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		const token = authHeader.replace("Bearer ", "");
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token);

		if (authError || !user) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		const body: RequestBody = await req.json();
		const { message, history = [], context = {} } = body;

		if (!message?.trim()) {
			return new Response(JSON.stringify({ error: "Message is required" }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// Build the contextual system prompt
		const systemPrompt = buildSystemPrompt(context);

		// Try Claude first if key is available; fall back to OpenAI
		let reply: string;
		const hasAnthropic = !!Deno.env.get("ANTHROPIC_API_KEY");
		const hasOpenAI = !!Deno.env.get("OPENAI_API_KEY");

		if (hasAnthropic) {
			reply = await callClaude(systemPrompt, history, message);
		} else if (hasOpenAI) {
			reply = await callOpenAI(systemPrompt, history, message);
		} else {
			// Graceful degradation \u2014 no API keys set yet
			reply = buildLocalFallback(message, context.role ?? "teacher");
		}

		return new Response(JSON.stringify({ reply }), {
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	} catch (err) {
		console.error("[ai-assistant] error:", err);
		return new Response(
			JSON.stringify({
				error: "Internal server error",
				reply: buildLocalFallback("", "teacher"),
			}),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
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
	if (lowerInput.includes("lesson") || lowerInput.includes("class")) {
		return "Lessons are more than delivery \u2014 they are shared experiences. How was the energy in the room?";
	}
	if (lowerInput.includes("tired") || lowerInput.includes("stress")) {
		return "Rest is not a luxury; it is a vital part of the cycle. How can you find a moment of stillness today?";
	}
	if (lowerInput.includes("student")) {
		return "Each student is a world unto themselves. What did one of them teach you today?";
	}
	if (role === "principal") {
		return "Leading a school means holding many realities at once. Which one needs your attention most right now?";
	}
	return "That is something worth sitting with. What feels most true about it to you?";
}
