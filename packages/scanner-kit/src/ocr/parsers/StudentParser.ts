/**
 * StudentParser \u2014 extracts ScannedStudent rows from an OCRRawResult
 *
 * Upgraded from OCRScanner.tsx's inline parseStudentData():
 * - Takes OCRRawResult (not raw string) for block-level processing
 * - Per-block confidence gating (< 0.4 \u2192 flagged as uncertain)
 * - Handles pipe/tab delimited, double-space delimited, and heuristic patterns
 * - Supports Sinhala (U+0D80\u2013U+0DFF) and Tamil (U+0B80\u2013U+0BFF) scripts
 */

import type { ScannedStudent } from "../../types";
import type { OCRRawResult } from "../types";

/** Minimum confidence to consider a block reliable */
const CONFIDENCE_THRESHOLD = 0.4;

export interface ParsedStudent extends ScannedStudent {
	/** Overall line confidence (0\u20131), averaged from blocks */
	confidence: number;
	/** True when confidence is below CONFIDENCE_THRESHOLD */
	uncertain: boolean;
}

/**
 * Parse students from a normalized OCRRawResult.
 * Returns ParsedStudent[] sorted in document order.
 */
export function parseStudents(result: OCRRawResult): ParsedStudent[] {
	// If we have blocks, use them for finer-grained processing.
	// Otherwise fall back to line-by-line text parsing.
	const lines = buildLines(result);
	const parsed: ParsedStudent[] = [];

	for (const { text, confidence } of lines) {
		const line = text.trim();
		if (!line || isHeaderLine(line)) continue;

		const student = parseLine(line);
		if (!student) continue;

		parsed.push({
			...student,
			confidence,
			uncertain: confidence < CONFIDENCE_THRESHOLD,
		});
	}

	// Deduplicate by name
	return parsed.filter(
		(s, idx, self) => idx === self.findIndex((o) => o.name === s.name),
	);
}

// \u2500\u2500 Line extraction \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

interface RawLine {
	text: string;
	confidence: number;
}

function buildLines(result: OCRRawResult): RawLine[] {
	if (result.blocks.length === 0) {
		// Plain text fallback \u2014 no block data available
		return result.text
			.split("\n")
			.filter((t) => t.trim().length > 0)
			.map((text) => ({ text, confidence: 1 }));
	}

	return result.blocks.map((block) => ({
		text: block.text,
		confidence: block.confidence ?? 1,
	}));
}

// \u2500\u2500 Header detection \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const HEADER_KEYWORDS = [
	"name",
	"index",
	"no.",
	"number",
	"\u0DC1\u0DD2\u0DC2\u0DCA\u200D\u0DBA",
	"\u0DB1\u0DB8",
	"\u0B8E\u0BA3\u0BCD",
	"\u0BAE\u0BBE\u0BA3\u0BB5\u0BB0\u0BCD",
];

function isHeaderLine(line: string): boolean {
	const lower = line.toLowerCase();
	return (
		line.length < 3 ||
		HEADER_KEYWORDS.some((kw) => lower.includes(kw)) ||
		/^[-=_|]+$/.test(line) // separator lines
	);
}

// \u2500\u2500 Per-line parsing strategies \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function parseLine(line: string): ScannedStudent | null {
	// Strategy 1: pipe or tab delimited  \u2192  "Name | Index"
	if (line.includes("|") || line.includes("\t")) {
		const parts = line
			.split(/[|\t]/)
			.map((p) => p.trim())
			.filter(Boolean);
		if (parts.length >= 2) {
			return {
				name: parts[0]!,
				index_number: parts[1]!,
				notes: parts.slice(2).join(" ") || undefined,
			};
		}
	}

	// Strategy 2: double-space delimited  \u2192  "Kamal Perera   42"
	const spaceSplit = line
		.split(/\s{2,}/)
		.map((p) => p.trim())
		.filter(Boolean);
	if (spaceSplit.length >= 2) {
		const possibleIndex = spaceSplit.find((part) => /^\d+$/.test(part));
		const name = spaceSplit[0];
		if (possibleIndex && name) {
			return {
				name,
				index_number: possibleIndex,
				notes:
					spaceSplit
						.slice(1)
						.filter((p) => p !== possibleIndex)
						.join(" ") || undefined,
			};
		}
	}

	// Strategy 3: heuristic \u2014 line with both a name-like substring and a number
	const HAS_NUMBERS = /\d+/.test(line);
	const HAS_LETTERS = /[a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF]{3,}/.test(line);

	if (HAS_NUMBERS && HAS_LETTERS) {
		const nameMatch = line.match(/^([a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF\s.]+)/);
		const indexMatch = line.match(/(\d+)/);
		if (nameMatch && indexMatch) {
			return {
				name: nameMatch[1]!.trim(),
				index_number: indexMatch[1]!,
			};
		}
	}

	return null;
}
