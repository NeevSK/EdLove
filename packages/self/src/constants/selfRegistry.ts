/**
 * SelfSection Registry
 * Defines the logical layering for each user role.
 */

export interface SelfModuleRegistry {
	id: string;
	label: string;
	description: string;
	layer: "personal" | "working";
	required?: boolean;
	discoveryInfo?: {
		whatIsIt: string;
		whereToFind: string;
	};
}

/**
 * Emoji mapping for common features to add soul to the UI.
 */
export const FEATURE_EMOJIS: Record<string, string> = {
	energy_pulse: "\u26A1",
	mood_checkin: "\uD83E\uDEB7",
	mood_lotus: "\uD83E\uDEB7",
	study_rhythm: "\u23F3",
	daily_rhythm: "\u23F3",
	goals: "\uD83C\uDFAF",
	grades: "\uD83D\uDCDC",
	voice_journaling: "\uD83C\uDF99\uFE0F",
	voice: "\uD83C\uDF99\uFE0F",
	school_pulse: "\uD83D\uDCC8",
	teacher_pulse: "\uD83D\uDCC8",
	decisions: "\u2696\uFE0F",
	decision_mirror: "\u2696\uFE0F",
	wisdom: "\uD83C\uDF31",
	reflections: "\uD83E\uDE9E",
	breath_presence: "\uD83C\uDF2C\uFE0F",
	breath: "\uD83C\uDF2C\uFE0F",
	journal: "\uD83D\uDCD3",
	banyan_path: "\uD83C\uDF33",
	professional_growth: "\uD83C\uDF33",
	faculty_resonance: "\uD83C\uDF00",
	systemic_overview: "\uD83C\uDF10",
	ecosystem_dash: "\uD83C\uDF10",
	strategic_wisdom: "\uD83D\uDDFA\uFE0F",
	strategic_pulse: "\uD83D\uDDFA\uFE0F",
	system_health: "\uD83D\uDEE0\uFE0F",
	user_resonance: "\uD83D\uDC65",
	mirrors: "\uD83E\uDE9E",
	reminders: "\uD83D\uDD14",
	holistic_history: "\uD83D\uDCDC",
	joy_jar: "\uD83C\uDFFA",
	sleep: "\uD83D\uDE34",
	fire_journal: "\uD83D\uDD25",
	tomorrow: "\uD83C\uDF05",
	vision_lab: "\uD83D\uDD2C",
	philosophy_lab: "\uD83C\uDFDB\uFE0F",
};

/**
 * Feature Discovery Metadata
 * Provides friendly explanations for each feature.
 */
export const FEATURE_DISCOVERY_DATA: Record<
	string,
	{ whatIsIt: string; whereToFind: string }
> = {
	energy_pulse: {
		whatIsIt:
			"A daily check-in to track your physical and mental energy levels, helping you find your optimal study rhythm.",
		whereToFind: "Located in your Personal Sanctuary hub.",
	},
	mood_checkin: {
		whatIsIt:
			"A space to log your emotions and see patterns over time. Understanding your mood is the first step up the emotional resonance ladder.",
		whereToFind:
			"Top of your Self screen, accessible anytime for a quick reflection.",
	},
	study_rhythm: {
		whatIsIt:
			'Tracks your focus periods and rest cycles to ensure you are learning with "Breath-like Motion".',
		whereToFind: "Under the Growth domain in your Self dashboard.",
	},
	goals: {
		whatIsIt:
			"Your personal quest log. Set intentions for your growth, academic or personal.",
		whereToFind: "In the Working domain of your Self section.",
	},
	grades: {
		whatIsIt:
			'A "Academic Mirror" that shows your progress without the pressure of raw numbers, focusing on growth trends.',
		whereToFind:
			"Found in the Working domain, reflecting your scholastic journey.",
	},
	voice_journaling: {
		whatIsIt:
			'Speak your heart. A hands-free way to capture reflections through the "Voice of the Soul".',
		whereToFind: "Accessible via the microphone icon in your daily rituals.",
	},
	school_pulse: {
		whatIsIt:
			"A real-time overview of your school's collective energy and engagement levels.",
		whereToFind: "In the Working domain of the Leadership dashboard.",
	},
	decisions: {
		whatIsIt:
			'A structured space to track and reflect on institutional choices using "Strategic Wisdom".',
		whereToFind: "Found in your professional working layer.",
	},
	wisdom: {
		whatIsIt:
			"A curated repository of insights and philosophical foundations for your educational journey.",
		whereToFind: "Under the Wisdom domain in your Self view.",
	},
	reflections: {
		whatIsIt:
			"Deeper insights generated from your activity, helping you mirror your inner self.",
		whereToFind: "Located in the personal reflections layer.",
	},
	breath_presence: {
		whatIsIt:
			"Mindful breathing exercises designed to restore focus and presence between classes.",
		whereToFind: "In your personal rituals section.",
	},
	journal: {
		whatIsIt: "A private space for written reflections and creative sparks.",
		whereToFind: "Part of your personal growth layer.",
	},
	banyan_path: {
		whatIsIt:
			"A visual map of your professional development and pedagogical experiments.",
		whereToFind: "In the working domain for educators.",
	},
	faculty_resonance: {
		whatIsIt:
			"Connect with fellow educators to share insights and foster collective growth.",
		whereToFind: "The social hub of your professional layer.",
	},
	systemic_overview: {
		whatIsIt: "High-level analytics across the entire educational ecosystem.",
		whereToFind: "Executive layer of the Strategic dashboard.",
	},
	strategic_wisdom: {
		whatIsIt:
			"Long-term planning tools and philosophical guidance for institutional growth.",
		whereToFind: "Under the Strategic domain for Leadership.",
	},
	system_health: {
		whatIsIt:
			"Technical monitoring and operational status of the Gurudevi platform.",
		whereToFind: "In the Working domain for Platform Guardians.",
	},
	user_resonance: {
		whatIsIt:
			"Tools to monitor and improve the quality of interactions across the user base.",
		whereToFind: "Guardian dashboard, focusing on community health.",
	},
	mirrors: {
		whatIsIt:
			'A collection of "Life Reflections" derived from your interactions and moods.',
		whereToFind: "The special Reflections tab in your Discovery Hub.",
	},
	reminders: {
		whatIsIt:
			"Timely prompts to keep you aligned with your daily rituals and goals.",
		whereToFind: "The Reminders tab in your Discovery Hub.",
	},
	teacher_pulse: {
		whatIsIt:
			"A real-time reflection of your instructional impact and professional growth.",
		whereToFind: "Located in the working layer of your Educator sanctuary.",
	},
	mood_lotus: {
		whatIsIt: "An interactive visualization of your emotional state over time.",
		whereToFind: "Found in your personal growth layer.",
	},
	daily_rhythm: {
		whatIsIt: "A visualization of your daily flow, balancing rest and focus.",
		whereToFind: "In your daily rituals section.",
	},
	professional_growth: {
		whatIsIt: "A map of your journey through the pedagogical landscape.",
		whereToFind: "In the working domain for educators.",
	},
	joy_jar: {
		whatIsIt:
			'A collection of "Glimmers" \u2014 small moments of shared joy and connection.',
		whereToFind: "In your personal sanctuary.",
	},
	sleep: {
		whatIsIt:
			"Track your rest pattern to understand how it fuels your daily energy.",
		whereToFind: "In your personal rituals section.",
	},
	fire_journal: {
		whatIsIt:
			"A space for transformative reflections and clearing mental space.",
		whereToFind: "Part of your private journaling tools.",
	},
	tomorrow: {
		whatIsIt: "Set intentions and prepare your heart for the coming day.",
		whereToFind: "In your evening ritual section.",
	},
	strategic_pulse: {
		whatIsIt: "High-level orchestration of institutional health and direction.",
		whereToFind: "Leadership hub for Strategic Orchestration.",
	},
	decision_mirror: {
		whatIsIt:
			"Reflect on the legacy of your choices through the lens of Strategic Wisdom.",
		whereToFind: "Governance layer of the Leadership dashboard.",
	},
	vision_lab: {
		whatIsIt:
			"A technical and philosophical space for prototyping the future of Gurudevi.",
		whereToFind: "Reserved for the Strategic core.",
	},
	philosophy_lab: {
		whatIsIt:
			"A workspace for refining the foundational principles of our educational ecosystem.",
		whereToFind: "Strategic and Leadership wisdom layers.",
	},
	ecosystem_dash: {
		whatIsIt:
			"Collective analytics representing the health of the entire Gurudevi biosphere.",
		whereToFind: "Global dashboard for Ecosystem Guardians.",
	},
};
