/**
 * Generic Media Asset abstraction to decouple the platform
 * from specific providers like Cloudinary.
 */

export type MediaProvider = 'cloudinary' | 's3' | 'supabase' | 'local' | 'external';

export interface MediaAsset {
    id: string;              // Internal unique ID
    provider: MediaProvider; // The service storing the asset
    provider_key: string;    // provider specific ID (e.g. public_id for Cloudinary)
    provider_version?: string;

    // Core URLs
    url: string;             // Raw URL
    secure_url?: string;     // HTTPS URL
    thumbnail_url?: string;  // Preview/Thumbnail URL

    // Metadata
    format: string;          // e.g. 'pdf', 'mp4', 'png'
    resource_type: 'image' | 'video' | 'raw' | 'audio';
    bytes: number;           // File size in bytes
    width?: number;
    height?: number;
    duration?: number;       // For video/audio in seconds

    // State
    is_optimized: boolean;   // Has the provider processed it?
    created_at: string;
}

export interface MediaTransformations {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: string | 'auto';
    crop?: string;
}
