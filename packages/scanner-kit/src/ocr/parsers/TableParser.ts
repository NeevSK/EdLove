/**
 * TableParser  reconstructs table rows from spatial block layout
 *
 * Groups OCRBlocks into rows using Y-coordinate proximity, then sorts
 * each row's cells by X-coordinate. Produces an OCRTable with structured
 * row/cell data suitable for grade entry sheets, attendance registers,
 * mark sheets, and other tabular documents.
 *
 * Works best when blocks have boundingBox data (MLKit lines or Google Vision).
 * Falls back to line-by-line text splitting when spatial data is absent.
 */

import type { OCRBlock, OCRRawResult, OCRTable, OCRTableRow } from "../types";

/** Maximum vertical distance (px) between two blocks to be in the same row */
const ROW_PROXIMITY_PX = 15;

/**
 * Parse an OCRRawResult into a structured OCRTable.
 */
export function parseTable(result: OCRRawResult): OCRTable {
	const blocks = result.blocks.filter((b) => b.text.trim().length > 0);

	// If no spatial data available, fall back to text-line splitting
	const hasSpatial = blocks.some((b) => b.boundingBox !== undefined);
	if (!hasSpatial) {
		return parseTableFromText(result.text);
	}

	return parseTableFromBlocks(blocks);
}

//  Spatial grouping

function parseTableFromBlocks(blocks: OCRBlock[]): OCRTable {
	// Sort blocks by their Y midpoint
	const sorted = [...blocks].sort((a, b) => {
		const ay = midY(a);
		const by_ = midY(b);
		return ay - by_;
	});

	// Group into rows by Y-proximity
	const rowGroups: OCRBlock[][] = [];
	let currentRow: OCRBlock[] = [];

	for (const block of sorted) {
		if (currentRow.length === 0) {
			currentRow.push(block);
			continue;
		}

		const lastBlock = currentRow[currentRow.length - 1]!;
		if (Math.abs(midY(block) - midY(lastBlock)) <= ROW_PROXIMITY_PX) {
			currentRow.push(block);
		} else {
			rowGroups.push(currentRow);
			currentRow = [block];
		}
	}
	if (currentRow.length > 0) rowGroups.push(currentRow);

	// Within each row, sort cells by X position
	const rows: OCRTableRow[] = rowGroups.map((group) => ({
		cells: group
			.sort((a, b) => (a.boundingBox?.x ?? 0) - (b.boundingBox?.x ?? 0))
			.map((b) => b.text.trim()),
	}));

	return { rows };
}

function midY(block: OCRBlock): number {
	const box = block.boundingBox;
	if (!box) return 0;
	return box.y + box.height / 2;
}

//  Text fallback

function parseTableFromText(text: string): OCRTable {
	const rows: OCRTableRow[] = text
		.split("\n")
		.filter((line) => line.trim().length > 0)
		.map((line) => {
			// Split on pipe, tab, or 2+ spaces
			const cells = line
				.split(/[|\t]|\s{2,}/)
				.map((c) => c.trim())
				.filter(Boolean);
			return { cells: cells.length > 0 ? cells : [line.trim()] };
		});
	return { rows };
}
