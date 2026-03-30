/**
 * Media Utility Helpers
 *
 * Provider-agnostic helpers for the MediaAsset abstraction.
 * UI components MUST use these helpers instead of hardcoding provider logic.
 */

import { MediaAsset } from '../types/Media';

/**
 * Resolve the best available URL from a MediaAsset.
 * Prefers HTTPS secure URL, falls back to raw URL.
 */
export function getMediaUrl(media: MediaAsset | undefined): string | undefined {
    if (!media) return undefined;
    return media.secure_url || media.url || undefined;
}

/**
 * Resolve a thumbnail URL from a MediaAsset.
 * Falls back to the main media URL if no thumbnail is present.
 */
export function getMediaThumbnail(media: MediaAsset | undefined): string | undefined {
    if (!media) return undefined;
    return media.thumbnail_url || media.secure_url || media.url || undefined;
}

/**
 * Format a byte count into a human-readable file size string.
 * e.g. 1_234_567 \u2192 "1.2 MB"
 */
export function formatFileSize(bytes: number | undefined): string {
    if (bytes === undefined || bytes < 0) return '';
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Format a duration in seconds into a human-readable string.
 * e.g. 3661 \u2192 "1h 1m"  |  90 \u2192 "1m 30s"
 */
export function formatDuration(seconds: number | undefined): string {
    if (seconds === undefined || seconds < 0) return '';
    if (seconds === 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s > 0 ? `${s}s` : ''}`.trim();
    return `${s}s`;
}
