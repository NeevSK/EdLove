import type { GraphLink, GraphNode, KnowledgeTopology } from "@repo/core/types";

/**
 * KnowledgeParser  The "Universal Translator" for the Retina Graphics Engine.
 *
 * Responsible for converting external grammars (Mermaid, Markdown, AI lists)
 * into the canonical KnowledgeTopology format.
 */
export class KnowledgeParser {
	/**
	 * Parses a Mermaid-like flowchart syntax:
	 *
	 * graph TD
	 *   A[Node A] --> B[Node B]
	 *   B -- relationship --> C{Node C}
	 */
	static fromMermaid(input: string): KnowledgeTopology {
		const nodes: GraphNode[] = [];
		const links: GraphLink[] = [];

		const lines = input.split("\n");

		lines.forEach((line) => {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("graph")) return;

			// Simple regex for Mermaid-style parsing
			// Match: A[Label] --> B[Label]
			const arrowMatch = trimmed.match(
				/(\w+)(\[[^\]]+\]|{[^}]+})?\s*(-{2,}|-+\w+-+>)\s*(\w+)(\[[^\]]+\]|{[^}]+})?/,
			);

			if (arrowMatch?.[1] && arrowMatch[4]) {
				const id1 = arrowMatch[1];
				const label1 = arrowMatch[2];
				const id2 = arrowMatch[4];
				const label2 = arrowMatch[5];

				KnowledgeParser.ensureNode(nodes, id1, label1);
				KnowledgeParser.ensureNode(nodes, id2, label2);

				links.push({
					source: id1,
					target: id2,
					relationship: "related",
					value: 1,
				});
			} else {
				// Try single node definition: A[Label]
				const nodeMatch = trimmed.match(/(\w+)(\[[^\]]+\]|{[^}]+})/);
				if (nodeMatch?.[1] && nodeMatch[2]) {
					const id = nodeMatch[1];
					const label = nodeMatch[2];
					KnowledgeParser.ensureNode(nodes, id, label);
				}
			}
		});

		return { nodes, links };
	}

	private static ensureNode(
		nodes: GraphNode[],
		id: string,
		labelMarkup?: string,
	) {
		if (!nodes.find((n) => n.id === id)) {
			let label = id;
			if (labelMarkup) {
				label = labelMarkup.slice(1, -1); // Strip [ or {
			}

			nodes.push({
				id,
				label,
				type: "topic",
				group: "generated",
			});
		}
	}

	/**
	 * Converts a raw AI-generated string (e.g. comma separated or bulleted)
	 * into a sequential path (Dharma perspective style).
	 */
	static fromAIString(input: string): KnowledgeTopology {
		const lines = input
			.split(/[,\n]/)
			.map((s) => s.trim())
			.filter(Boolean);
		const nodes: GraphNode[] = lines.map((text, index) => ({
			id: `ai-${index}`,
			label: text,
			type: "topic",
			group: "ai-generated",
			path: {
				order: index,
				dependencies: [],
			},
		}));

		const links: GraphLink[] = [];
		for (let i = 0; i < nodes.length - 1; i++) {
			const source = nodes[i];
			const target = nodes[i + 1];
			if (source && target) {
				links.push({
					source: source.id,
					target: target.id,
					relationship: "path",
					value: 1,
				});
			}
		}

		return { nodes, links };
	}
}
