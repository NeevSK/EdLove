import { supabase } from '../lib/supabase';
import { growthSignalsAPI } from './growthSignals';
import { impactRipplesAPI } from './impactRipples';
// types are defined below
export type ManifestoVibe = 'visionary' | 'supportive' | 'academic' | 'wellbeing';
export type ManifestoStatus = 'active' | 'archived' | 'fulfilled';

export interface SanctuaryManifesto {
    id: string;
    school_id: string;
    creator_id: string;
    title: string;
    content: string;
    vibe: ManifestoVibe;
    status: ManifestoStatus;
    target_date?: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    endorsement_count?: number;
    has_endorsed?: boolean;
}

export const sacredMissionsAPI = {
    /**
     * Fetch manifestos for a school
     */
    async getManifestos(schoolId: string, userId?: string) {
        const { data, error } = await supabase
            .from('sanctuary_manifestos')
            .select(`
        *,
        manifesto_endorsements(count)
      `)
            .eq('school_id', schoolId)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // If userId provided, check if user has endorsed
        let userEndorsements: string[] = [];
        if (userId) {
            const { data: endData } = await supabase
                .from('manifesto_endorsements')
                .select('manifesto_id')
                .eq('user_id', userId);

            if (endData) {
                userEndorsements = endData.map(e => e.manifesto_id);
            }
        }

        return data.map(m => ({
            ...m,
            endorsement_count: m.manifesto_endorsements?.[0]?.count || 0,
            has_endorsed: userEndorsements.includes(m.id)
        })) as SanctuaryManifesto[];
    },

    /**
     * Create a new manifesto (Principals/Admins only)
     */
    async createManifesto(input: {
        school_id: string;
        creator_id: string;
        title: string;
        content: string;
        vibe: ManifestoVibe;
        target_date?: string;
    }) {
        const { data, error } = await supabase
            .from('sanctuary_manifestos')
            .insert(input)
            .select()
            .single();

        if (error) throw error;
        return data as SanctuaryManifesto;
    },

    /**
     * Endorse a manifesto
     */
    async endorseManifesto(manifestoId: string, userId: string, commitmentText?: string) {
        // Fetch the manifesto's creator_id for the Impact Ripple
        const { data: manifesto } = await supabase
            .from('sanctuary_manifestos')
            .select('creator_id')
            .eq('id', manifestoId)
            .maybeSingle();

        const { error } = await supabase
            .from('manifesto_endorsements')
            .upsert({
                manifesto_id: manifestoId,
                user_id: userId,
                commitment_text: commitmentText
            });

        if (error) throw error;

        // Growth signal: teacher actively participated in community alignment (Weaving dimension)
        void growthSignalsAPI.emitSignal(userId, 'manifesto_endorsed', {
            manifesto_id: manifestoId,
        }).catch(() => {});

        // Impact Ripple for the manifesto creator — "a fellow teacher endorsed your vision"
        if (manifesto?.creator_id && manifesto.creator_id !== userId) {
            void impactRipplesAPI.createRipple({
                recipientUserId: manifesto.creator_id,
                actorUserId: userId,
                rippleType: 'manifesto_endorsed',
                sourceEntityType: 'manifesto',
                sourceEntityId: manifestoId,
            }).catch(() => {});
        }

        return true;
    },

    /**
     * Remove endorsement
     */
    async unendorseManifesto(manifestoId: string, userId: string) {
        const { error } = await supabase
            .from('manifesto_endorsements')
            .delete()
            .eq('manifesto_id', manifestoId)
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    }
};
