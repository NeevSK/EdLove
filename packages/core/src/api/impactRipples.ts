/**
 * Impact Ripples API — the Relatedness layer of the Bhumi Growth Model.
 *
 * An Impact Ripple is a warm, private signal delivered to a contributor when
 * their work genuinely resonates with another person in their community.
 * It is the operationalization of Relatedness (Self-Determination Theory) —
 * not a score, not a rank, but a soft echo of real human impact.
 *
 * Philosophy (see GROWTH_MODEL.md v2.0 — Section 3: "The Impact Ripple"):
 *   - Each ripple is specific to ONE interaction — each one lives as its own complete moment
 *   - Actor identity is held privately by default; visible only when the actor chooses to share
 *   - Delivered in gentle batches (3-4× per day) — the teacher's day flows uninterrupted
 *   - Language is warm and human always — specific to the real thing that happened
 *   - A soft echo of real human impact — each one its own complete story
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE (fire-and-forget, always after the primary operation):
 *
 *   void impactRipplesAPI.createRipple({
 *     recipientUserId: resource.creator_id,
 *     actorUserId:     userId,
 *     rippleType:      'resource_saved',
 *     schoolId:        schoolId,
 *     sourceEntityType:'resource',
 *     sourceEntityId:   resourceId,
 *   }).catch(() => {});
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type RippleType =
    | 'resource_saved'           // A colleague saved/bookmarked a resource you created
    | 'resource_read'            // Your resource reached a threshold of unique readers
    | 'post_sparked'             // Your community post received at least one genuine reply
    | 'lesson_accessed'          // A student opened your lesson material
    | 'feedback_given'           // Someone wrote thoughtful written feedback on your work
    | 'manifesto_endorsed'       // Someone endorsed a manifesto you created
    | 'circle_joined'            // Someone joined a community circle you started
    | 'principal_recognition';   // Principal sent a Gratitude Gift (lantern / rain / sunlight / seed)

export type RippleSourceEntityType =
    | 'resource'
    | 'community_post'
    | 'lesson'
    | 'manifesto'
    | 'circle'
    | 'gratitude_gift';  // Used when a principal sends a Gratitude Gift

export interface CreateRippleInput {
    recipientUserId: string;
    actorUserId?: string;          // Optional — held privately by default; surfaced only by actor's choice
    rippleType: RippleType;
    schoolId?: string;
    sourceEntityType?: RippleSourceEntityType;
    sourceEntityId?: string;
    isActorVisible?: boolean;      // Defaults to false
}

export interface ImpactRipple {
    id: string;
    recipient_user_id: string;
    ripple_type: RippleType;
    school_id: string | null;
    actor_user_id: string | null;
    is_actor_visible: boolean;
    source_entity_type: RippleSourceEntityType | null;
    source_entity_id: string | null;
    warm_message_si: string | null;
    warm_message_ta: string | null;
    warm_message_en: string;
    delivered: boolean;
    delivered_at: string | null;
    batch_window: string | null;
    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// WARM MESSAGE TEMPLATES
// English: authoritative copy.
// Sinhala (si): draft translations — MUST be reviewed by a native Sri Lankan
//               educator before production use. See GROWTH_MODEL.md note.
// Tamil (ta): placeholder — pending translation.
// ─────────────────────────────────────────────────────────────────────────────

const WARM_MESSAGES: Record<RippleType, { en: string; si: string; ta: string }> = {
    resource_saved: {
        en: 'A teacher in your school kept your resource close.',
        si: 'ඔබේ පාසලේ ගුරු හිතෙකු ඔබේ දෙය ළඟ රැකි ගත් ය.', // pending native review
        ta: 'உங்கள் பள்ளியிலுள்ள ஒரு ஆசிரியர் உங்கள் ஆதாரத்தை நெருங்கி வைத்திருக்கிறார்.', // pending native review
    },
    resource_read: {
        en: 'Five people in your school have learned from what you shared.',
        si: 'ඔබේ පාසලේ ජනයා 5 දෙනෙකු ඔබ බෙදාගත් දෙයෙන් ඉගෙන ගත්හ.', // pending native review
        ta: 'உங்கள் பள்ளியிலுள்ள ஐந்து பேர் நீங்கள் பகிர்ந்ததிலிருந்து கற்றுக்கொண்டனர்.', // pending native review
    },
    post_sparked: {
        en: 'Your reflection opened a conversation.',
        si: 'ඔබේ සිතුවිල්ල කතාවකට දොර හැරියා.',
        ta: 'உங்கள் சிந்தனை ஒரு உரையாடலைத் திறந்தது.', // pending native review
    },
    lesson_accessed: {
        en: 'A student is learning from what you prepared.',
        si: 'ඔබ සූදාන් කළ දෙය දරුවකු ඉගෙන ගනී.',
        ta: 'நீங்கள் தயாரித்ததிலிருந்து ஒரு மாணவர் கற்றுக்கொள்கிறார்.', // pending native review
    },
    feedback_given: {
        en: 'Your teacher thought carefully about your work.',
        si: 'ඔබේ ගුරුතුමා ඔබේ කාර්යයේ ගැඹුරට ගිය ය.',
        ta: 'உங்கள் ஆசிரியர் உங்கள் வேலையைப் பற்றி கவனமாக சிந்தித்தார்.', // pending native review
    },
    manifesto_endorsed: {
        en: 'A fellow teacher endorsed your vision.',
        si: 'සහ ගුරු හිතෙකු ඔබේ දෘෂ්ටිය අනුමත කළ ය.',
        ta: 'ஒரு சக ஆசிரியர் உங்கள் தொலைநோக்கை ஆதரித்தார்.', // pending native review
    },
    circle_joined: {
        en: 'A colleague joined the circle you started.',
        si: 'ඔබ ආරම්භ කළ කවියට සහයෝගීකයෙකු එක් විය.', // pending native review
        ta: 'நீங்கள் தொடங்கிய வட்டத்தில் ஒரு சக ஊழியர் சேர்ந்தார்.', // pending native review
    },
    principal_recognition: {
        en: 'Your principal sent you a gift of light today.',
        si: 'ඔබේ විදුහල්පති ඔබට ආලෝකයේ තෑග්ගක් යැව්වා.',   // pending native review
        ta: 'இன்று உங்கள் அதிபர் உங்களுக்கு ஒளியின் பரிசை அனுப்பினார்.', // pending native review
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// BATCH WINDOW HELPER
// Ripples are batched into 4 delivery windows per day.
// ─────────────────────────────────────────────────────────────────────────────

function getBatchWindow(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) return 'morning';
    if (hour >= 9 && hour < 15) return 'day';
    if (hour >= 15 && hour < 20) return 'evening';
    return 'night';
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPACT RIPPLES API
// ─────────────────────────────────────────────────────────────────────────────

export const impactRipplesAPI = {
    /**
     * Create a new Impact Ripple for a contributor.
     *
     * Called by existing API methods when one user's action impacts another user's
     * contribution. Always fire-and-forget — the primary operation completes first.
     *
     * Actor identity is held privately; visible to the recipient only when the actor has chosen to share.
     * Warm messages are pre-rendered at creation time in all three languages.
     */
    async createRipple(input: CreateRippleInput): Promise<void> {
        // Do not create a ripple if the actor and recipient are the same person
        if (input.actorUserId && input.actorUserId === input.recipientUserId) return;

        const messages = WARM_MESSAGES[input.rippleType];

        try {
            await supabase
                .from('impact_ripples')
                .insert({
                    recipient_user_id: input.recipientUserId,
                    ripple_type: input.rippleType,
                    school_id: input.schoolId ?? null,
                    actor_user_id: input.actorUserId ?? null,
                    is_actor_visible: input.isActorVisible ?? false,
                    source_entity_type: input.sourceEntityType ?? null,
                    source_entity_id: input.sourceEntityId ?? null,
                    warm_message_en: messages.en,
                    warm_message_si: messages.si,
                    warm_message_ta: messages.ta,
                    batch_window: getBatchWindow(),
                    delivered: false,
                });
        } catch (err) {
            console.warn('[ImpactRipples] Failed to create ripple:', err instanceof Error ? err.message : String(err));
        }
    },

    /**
     * Fetch pending (undelivered) ripples for a user.
     * Used by the notification delivery system to batch ripples 3–4× per day.
     */
    async getPendingRipples(userId: string): Promise<ImpactRipple[]> {
        const { data, error } = await supabase
            .from('impact_ripples')
            .select('*')
            .eq('recipient_user_id', userId)
            .eq('delivered', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('[ImpactRipples] Failed to fetch pending ripples:', error.message);
            return [];
        }

        return (data ?? []) as ImpactRipple[];
    },

    /**
     * Mark a ripple as delivered.
     * Called after the in-app notification has been displayed to the recipient.
     */
    async markDelivered(rippleId: string): Promise<void> {
        try {
            await supabase
                .from('impact_ripples')
                .update({
                    delivered: true,
                    delivered_at: new Date().toISOString(),
                })
                .eq('id', rippleId);
        } catch (err) {
            console.warn('[ImpactRipples] Failed to mark delivered:', err instanceof Error ? err.message : String(err));
        }
    },

    /**
     * Fetch recently delivered ripples for a user (for Warm Mirror context).
     * Returns the last N delivered ripples within the specified window.
     */
    async getDeliveredSince(userId: string, since: string): Promise<ImpactRipple[]> {
        const { data, error } = await supabase
            .from('impact_ripples')
            .select('*')
            .eq('recipient_user_id', userId)
            .eq('delivered', true)
            .gte('delivered_at', since)
            .order('delivered_at', { ascending: false });

        if (error) {
            console.warn('[ImpactRipples] Failed to fetch delivered ripples:', error.message);
            return [];
        }

        return (data ?? []) as ImpactRipple[];
    },
};
