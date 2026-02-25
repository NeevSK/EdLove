/**
 * StudentParser — extracts ScannedStudent rows from an OCRRawResult
 *
 * Upgraded from OCRScanner.tsx's inline parseStudentData():
 * - Takes OCRRawResult (not raw string) for block-level processing
 * - Per-block confidence gating (< 0.4 → flagged as uncertain)
 * - Handles pipe/tab delimited, double-space delimited, and heuristic patterns
 * - Supports Sinhala (U+0D80–U+0DFF) and Tamil (U+0B80–U+0BFF) scripts
 */

import type { OCRRawResult } from '../types';
import type { ScannedStudent } from '../../OCRScanner';

/** Minimum confidence to consider a block reliable */
const CONFIDENCE_THRESHOLD = 0.4;

export interface ParsedStudent extends ScannedStudent {
  /** Overall line confidence (0–1), averaged from blocks */
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
    (s, idx, self) => idx === self.findIndex(o => o.name === s.name),
  );
}

// ── Line extraction ────────────────────────────────────────────────────────

interface RawLine {
  text: string;
  confidence: number;
}

function buildLines(result: OCRRawResult): RawLine[] {
  if (result.blocks.length === 0) {
    // Plain text fallback — no block data available
    return result.text
      .split('\n')
      .filter(t => t.trim().length > 0)
      .map(text => ({ text, confidence: 1 }));
  }

  return result.blocks.map(block => ({
    text: block.text,
    confidence: block.confidence ?? 1,
  }));
}

// ── Header detection ───────────────────────────────────────────────────────

const HEADER_KEYWORDS = [
  'name', 'index', 'no.', 'number', 'ශිෂ්‍ය', 'නම', 'எண்', 'மாணவர்',
];

function isHeaderLine(line: string): boolean {
  const lower = line.toLowerCase();
  return (
    line.length < 3 ||
    HEADER_KEYWORDS.some(kw => lower.includes(kw)) ||
    /^[-=_|]+$/.test(line) // separator lines
  );
}

// ── Per-line parsing strategies ────────────────────────────────────────────

function parseLine(line: string): ScannedStudent | null {
  // Strategy 1: pipe or tab delimited  →  "Name | Index"
  if (line.includes('|') || line.includes('\t')) {
    const parts = line.split(/[|\t]/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { name: parts[0]!, index_number: parts[1]!, notes: parts.slice(2).join(' ') || undefined };
    }
  }

  // Strategy 2: double-space delimited  →  "Kamal Perera   42"
  const spaceSplit = line.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);
  if (spaceSplit.length >= 2) {
    const possibleIndex = spaceSplit.find(part => /^\d+$/.test(part));
    const name = spaceSplit[0];
    if (possibleIndex && name) {
      return {
        name,
        index_number: possibleIndex,
        notes: spaceSplit.slice(1).filter(p => p !== possibleIndex).join(' ') || undefined,
      };
    }
  }

  // Strategy 3: heuristic — line with both a name-like substring and a number
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
