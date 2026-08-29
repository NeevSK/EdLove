/**
 * High-Performance Rich Text Segmenter & Linkifier
 * Inspired by BlueSky's bsky-rich-text-segmenter for zero-lag text rendering inside @shopify/flash-list.
 */

export interface TextSegment {
  text: string;
  type: 'text' | 'mention' | 'hashtag' | 'url';
  target?: string;
}

const MENTION_REGEX = /@([a-zA-Z0-9_.-]+)/g;
const HASHTAG_REGEX = /#([a-zA-Z0-9_]+)/g;
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function segmentRichText(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  // Tokenize string by matching URLs, mentions, and hashtags
  const combinedRegex = /(https?:\/\/[^\s]+)|(@[a-zA-Z0-9_.-]+)|(#[a-zA-Z0-9_]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combinedRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        type: 'text',
      });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('http')) {
      segments.push({
        text: matchedStr,
        type: 'url',
        target: matchedStr,
      });
    } else if (matchedStr.startsWith('@')) {
      segments.push({
        text: matchedStr,
        type: 'mention',
        target: matchedStr.slice(1),
      });
    } else if (matchedStr.startsWith('#')) {
      segments.push({
        text: matchedStr,
        type: 'hashtag',
        target: matchedStr.slice(1),
      });
    }

    lastIndex = combinedRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      type: 'text',
    });
  }

  return segments;
}
