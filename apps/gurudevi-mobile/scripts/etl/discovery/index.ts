import { supabase } from "../utils/supabase";
import { runAISearch } from "./sources/ai-search";
import { runYouTubeDiscovery } from "./sources/youtube";

interface DiscoveryItem {
	title: string;
	description?: string;
	url: string;
	source_type: string;
	content_type: string;
	language?: string[];
	target_roles?: string[];
	author_name?: string;
	published_at?: string;
}

export async function runDiscovery() {
	console.log("--- ETL Discovery Started ---");

	const allFound: DiscoveryItem[] = [];

	// 1. YouTube Discovery
	try {
		const youtubeResult = await runYouTubeDiscovery();
		allFound.push(...youtubeResult);
		console.log(`YouTube found ${youtubeResult.length} items.`);
	} catch (err) {
		console.error("YouTube discovery failed:", err);
	}

	// 2. AI Search (Librarian)
	try {
		const aiResult = await runAISearch();
		allFound.push(...aiResult);
		console.log(`AI Search found ${aiResult.length} items.`);
	} catch (err) {
		console.error("AI search failed:", err);
	}

	console.log(`Total items found: ${allFound.length}`);

	if (allFound.length > 0) {
		const { data, error } = await supabase
			.from("staging")
			.upsert(allFound, { onConflict: "url" });

		if (error) {
			console.error("Error inserting into staging:", error);
		} else {
			console.log(`Successfully staged ${allFound.length} items.`);
		}
	}

	console.log("--- ETL Discovery Complete ---");
}

if (require.main === module) {
	runDiscovery().catch(console.error);
}
