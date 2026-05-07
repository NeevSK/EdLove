/**
 * --- Sovereign Ingest Service ---
 * A lightweight, zero-cost ingestion engine powered by Jina AI Reader.
 * It transforms raw web content into structured Markdown for Dossiers.
 */
export class IngestService {
	private static readonly JINA_READER_URL = "https://r.jina.ai/";

	/**
	 * Fetches and transforms a URL into clean Markdown.
	 */
	async fetchMarkdown(
		url: string,
		options?: { apiKey?: string },
	): Promise<string> {
		const targetUrl = `${IngestService.JINA_READER_URL}${url}`;

		try {
			const response = await fetch(targetUrl, {
				headers: options?.apiKey
					? { Authorization: `Bearer ${options.apiKey}` }
					: {},
			});

			if (!response.ok) {
				throw new Error(`Ingest failed for ${url}: ${response.statusText}`);
			}

			return await response.text();
		} catch (error) {
			console.error("[IngestService] Error:", error);
			throw error;
		}
	}
}
