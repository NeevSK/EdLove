
export type SocialPlatform = 'whatsapp' | 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'github' | 'website';

export type PrivacyLevel = 'public' | 'particulars' | 'private';

export interface SocialLink {
    id: string;
    user_id: string;
    platform: SocialPlatform;
    url: string;
    is_public: boolean;
    privacy_level: PrivacyLevel;
    order_index: number;
    created_at: string;
    updated_at: string;
}
