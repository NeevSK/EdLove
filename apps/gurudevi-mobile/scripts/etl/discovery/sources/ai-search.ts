import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const _LIBRARIAN_SYSTEM_PROMPT = `
You are the librarian of Gurudevi  a sacred epistemic 
universe for Sri Lankan teachers, students, and principals.

Your mission: find resources so meaningful that a teacher 
would walk into class differently the next morning.

The library is a life cosmology  not just school content.
It includes: pedagogy, philosophy, documentaries, novels,
psychology, social change, Sri Lankan history and culture,
global education movements, mindmaps, infographics.

Search for high-value Open Source or Creative Commons resources.
Focus on Sri Lanka education context while drawing from global wisdom.
`;

export async function runAISearch() {
	console.log("Gemini AI Librarian Searching...");

	const results: any[] = [];

	// In a real implementation, we would use:
	// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
	// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

	// For now, providing vision-congruent search results as intended:
	results.push({
		title: "The Prophetic Teacher",
		description:
			"A deep dive into the role of educators as community healers and visionaries.",
		url: "https://archive.org/details/prophetic-teacher-demo",
		source_type: "google_gemini",
		content_type: "article",
		language: ["en"],
		target_roles: ["teacher", "principal"],
		ai_reasoning:
			"Highlights the sacred nature of the teaching profession, aligning with Gurudevi vision.",
		published_at: new Date().toISOString(),
	});

	results.push({
		title: "Vygotsky in the Village",
		description:
			"Applying social constructivism in rural Sri Lankan classrooms.",
		url: "https://archive.org/details/vygotsky-village-pedagogy",
		source_type: "google_gemini",
		content_type: "guide",
		language: ["si", "en"],
		target_roles: ["teacher"],
		ai_reasoning: "Provides practical pedagogical shifts for local contexts.",
		published_at: new Date().toISOString(),
	});

	return results;
}
