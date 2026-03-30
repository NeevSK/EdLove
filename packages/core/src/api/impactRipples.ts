/**
 * Impact Ripples API \u2014 the Relatedness layer of the Bhumi Growth Model.
 *
 * An Impact Ripple is a warm, private signal delivered to a contributor when
 * their work genuinely resonates with another person in their community.
 * It is the operationalization of Relatedness (Self-Determination Theory) \u2014
 * not a score, not a rank, but a soft echo of real human impact.
 *
 * Philosophy (see GROWTH_MODEL.md v2.0 \u2014 Section 3: "The Impact Ripple"):
 *   - Each ripple is specific to ONE interaction \u2014 each one lives as its own complete moment
 *   - Actor identity is held privately by default; visible only when the actor chooses to share
 *   - Delivered in gentle batches (3-4\u00D7 per day) \u2014 the teacher's day flows uninterrupted
 *   - Language is warm and human always \u2014 specific to the real thing that happened
 *   - A soft echo of real human impact \u2014 each one its own complete story
 *
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
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
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 */

import { supabase } from '../lib/supabase';

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// TYPES
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

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
    actorUserId?: string;          // Optional \u2014 held privately by default; surfaced only by actor's choice
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

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// WARM MESSAGE TEMPLATES
// English: authoritative copy.
// Sinhala (si): draft translations \u2014 MUST be reviewed by a native Sri Lankan
//               educator before production use. See GROWTH_MODEL.md note.
// Tamil (ta): placeholder \u2014 pending translation.
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const WARM_MESSAGES: Record<RippleType, { en: string; si: string; ta: string }> = {
    resource_saved: {
        en: 'A teacher in your school kept your resource close.',
        si: '\u0D94\u0DB6\u0DDA \u0DB4\u0DCF\u0DC3\u0DBD\u0DDA \u0D9C\u0DD4\u0DBB\u0DD4 \u0DC4\u0DD2\u0DAD\u0DD9\u0D9A\u0DD4 \u0D94\u0DB6\u0DDA \u0DAF\u0DD9\u0DBA \u0DC5\u0D9F \u0DBB\u0DD0\u0D9A\u0DD2 \u0D9C\u0DAD\u0DCA \u0DBA.', // pending native review
        ta: '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BAA\u0BB3\u0BCD\u0BB3\u0BBF\u0BAF\u0BBF\u0BB2\u0BC1\u0BB3\u0BCD\u0BB3 \u0B92\u0BB0\u0BC1 \u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B86\u0BA4\u0BBE\u0BB0\u0BA4\u0BCD\u0BA4\u0BC8 \u0BA8\u0BC6\u0BB0\u0BC1\u0B99\u0BCD\u0B95\u0BBF \u0BB5\u0BC8\u0BA4\u0BCD\u0BA4\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95\u0BBF\u0BB1\u0BBE\u0BB0\u0BCD.', // pending native review
    },
    resource_read: {
        en: 'Five people in your school have learned from what you shared.',
        si: '\u0D94\u0DB6\u0DDA \u0DB4\u0DCF\u0DC3\u0DBD\u0DDA \u0DA2\u0DB1\u0DBA\u0DCF 5 \u0DAF\u0DD9\u0DB1\u0DD9\u0D9A\u0DD4 \u0D94\u0DB6 \u0DB6\u0DD9\u0DAF\u0DCF\u0D9C\u0DAD\u0DCA \u0DAF\u0DD9\u0DBA\u0DD9\u0DB1\u0DCA \u0D89\u0D9C\u0DD9\u0DB1 \u0D9C\u0DAD\u0DCA\u0DC4.', // pending native review
        ta: '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BAA\u0BB3\u0BCD\u0BB3\u0BBF\u0BAF\u0BBF\u0BB2\u0BC1\u0BB3\u0BCD\u0BB3 \u0B90\u0BA8\u0BCD\u0BA4\u0BC1 \u0BAA\u0BC7\u0BB0\u0BCD \u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BAA\u0B95\u0BBF\u0BB0\u0BCD\u0BA8\u0BCD\u0BA4\u0BA4\u0BBF\u0BB2\u0BBF\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4\u0BC1 \u0B95\u0BB1\u0BCD\u0BB1\u0BC1\u0B95\u0BCD\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BA9\u0BB0\u0BCD.', // pending native review
    },
    post_sparked: {
        en: 'Your reflection opened a conversation.',
        si: '\u0D94\u0DB6\u0DDA \u0DC3\u0DD2\u0DAD\u0DD4\u0DC0\u0DD2\u0DBD\u0DCA\u0DBD \u0D9A\u0DAD\u0DCF\u0DC0\u0D9A\u0DA7 \u0DAF\u0DDC\u0DBB \u0DC4\u0DD0\u0DBB\u0DD2\u0DBA\u0DCF.',
        ta: '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B9A\u0BBF\u0BA8\u0BCD\u0BA4\u0BA9\u0BC8 \u0B92\u0BB0\u0BC1 \u0B89\u0BB0\u0BC8\u0BAF\u0BBE\u0B9F\u0BB2\u0BC8\u0BA4\u0BCD \u0BA4\u0BBF\u0BB1\u0BA8\u0BCD\u0BA4\u0BA4\u0BC1.', // pending native review
    },
    lesson_accessed: {
        en: 'A student is learning from what you prepared.',
        si: '\u0D94\u0DB6 \u0DC3\u0DD6\u0DAF\u0DCF\u0DB1\u0DCA \u0D9A\u0DC5 \u0DAF\u0DD9\u0DBA \u0DAF\u0DBB\u0DD4\u0DC0\u0D9A\u0DD4 \u0D89\u0D9C\u0DD9\u0DB1 \u0D9C\u0DB1\u0DD3.',
        ta: '\u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BA4\u0BAF\u0BBE\u0BB0\u0BBF\u0BA4\u0BCD\u0BA4\u0BA4\u0BBF\u0BB2\u0BBF\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4\u0BC1 \u0B92\u0BB0\u0BC1 \u0BAE\u0BBE\u0BA3\u0BB5\u0BB0\u0BCD \u0B95\u0BB1\u0BCD\u0BB1\u0BC1\u0B95\u0BCD\u0B95\u0BCA\u0BB3\u0BCD\u0B95\u0BBF\u0BB1\u0BBE\u0BB0\u0BCD.', // pending native review
    },
    feedback_given: {
        en: 'Your teacher thought carefully about your work.',
        si: '\u0D94\u0DB6\u0DDA \u0D9C\u0DD4\u0DBB\u0DD4\u0DAD\u0DD4\u0DB8\u0DCF \u0D94\u0DB6\u0DDA \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DBA\u0DDA \u0D9C\u0DD0\u0DB9\u0DD4\u0DBB\u0DA7 \u0D9C\u0DD2\u0DBA \u0DBA.',
        ta: '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BB5\u0BC7\u0BB2\u0BC8\u0BAF\u0BC8\u0BAA\u0BCD \u0BAA\u0BB1\u0BCD\u0BB1\u0BBF \u0B95\u0BB5\u0BA9\u0BAE\u0BBE\u0B95 \u0B9A\u0BBF\u0BA8\u0BCD\u0BA4\u0BBF\u0BA4\u0BCD\u0BA4\u0BBE\u0BB0\u0BCD.', // pending native review
    },
    manifesto_endorsed: {
        en: 'A fellow teacher endorsed your vision.',
        si: '\u0DC3\u0DC4 \u0D9C\u0DD4\u0DBB\u0DD4 \u0DC4\u0DD2\u0DAD\u0DD9\u0D9A\u0DD4 \u0D94\u0DB6\u0DDA \u0DAF\u0DD8\u0DC2\u0DCA\u0DA7\u0DD2\u0DBA \u0D85\u0DB1\u0DD4\u0DB8\u0DAD \u0D9A\u0DC5 \u0DBA.',
        ta: '\u0B92\u0BB0\u0BC1 \u0B9A\u0B95 \u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BA4\u0BCA\u0BB2\u0BC8\u0BA8\u0BCB\u0B95\u0BCD\u0B95\u0BC8 \u0B86\u0BA4\u0BB0\u0BBF\u0BA4\u0BCD\u0BA4\u0BBE\u0BB0\u0BCD.', // pending native review
    },
    circle_joined: {
        en: 'A colleague joined the circle you started.',
        si: '\u0D94\u0DB6 \u0D86\u0DBB\u0DB8\u0DCA\u0DB7 \u0D9A\u0DC5 \u0D9A\u0DC0\u0DD2\u0DBA\u0DA7 \u0DC3\u0DC4\u0DBA\u0DDD\u0D9C\u0DD3\u0D9A\u0DBA\u0DD9\u0D9A\u0DD4 \u0D91\u0D9A\u0DCA \u0DC0\u0DD2\u0DBA.', // pending native review
        ta: '\u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95\u0BBF\u0BAF \u0BB5\u0B9F\u0BCD\u0B9F\u0BA4\u0BCD\u0BA4\u0BBF\u0BB2\u0BCD \u0B92\u0BB0\u0BC1 \u0B9A\u0B95 \u0B8A\u0BB4\u0BBF\u0BAF\u0BB0\u0BCD \u0B9A\u0BC7\u0BB0\u0BCD\u0BA8\u0BCD\u0BA4\u0BBE\u0BB0\u0BCD.', // pending native review
    },
    principal_recognition: {
        en: 'Your principal sent you a gift of light today.',
        si: '\u0D94\u0DB6\u0DDA \u0DC0\u0DD2\u0DAF\u0DD4\u0DC4\u0DBD\u0DCA\u0DB4\u0DAD\u0DD2 \u0D94\u0DB6\u0DA7 \u0D86\u0DBD\u0DDD\u0D9A\u0DBA\u0DDA \u0DAD\u0DD1\u0D9C\u0DCA\u0D9C\u0D9A\u0DCA \u0DBA\u0DD0\u0DC0\u0DCA\u0DC0\u0DCF.',   // pending native review
        ta: '\u0B87\u0BA9\u0BCD\u0BB1\u0BC1 \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B85\u0BA4\u0BBF\u0BAA\u0BB0\u0BCD \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BC1\u0B95\u0BCD\u0B95\u0BC1 \u0B92\u0BB3\u0BBF\u0BAF\u0BBF\u0BA9\u0BCD \u0BAA\u0BB0\u0BBF\u0B9A\u0BC8 \u0B85\u0BA9\u0BC1\u0BAA\u0BCD\u0BAA\u0BBF\u0BA9\u0BBE\u0BB0\u0BCD.', // pending native review
    },
};

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// BATCH WINDOW HELPER
// Ripples are batched into 4 delivery windows per day.
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function getBatchWindow(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) return 'morning';
    if (hour >= 9 && hour < 15) return 'day';
    if (hour >= 15 && hour < 20) return 'evening';
    return 'night';
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// IMPACT RIPPLES API
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export const impactRipplesAPI = {
    /**
     * Create a new Impact Ripple for a contributor.
     *
     * Called by existing API methods when one user's action impacts another user's
     * contribution. Always fire-and-forget \u2014 the primary operation completes first.
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
     * Used by the notification delivery system to batch ripples 3\u20134\u00D7 per day.
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
