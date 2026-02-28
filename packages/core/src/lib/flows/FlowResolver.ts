
import { QRPayload } from '@repo/scanner-kit';
import { supabase } from '../../lib/supabase';
import { schoolAPI } from '../../api/school';
// Note: We'll use dynamic imports or passing refs for communityAPI to avoid circular deps if necessary, 
// but for now let's assume core is the base.
import { UserRole } from '../../types';

export type FlowOutcome = 'success' | 'error' | 'pending_auth' | 'redirect';

export type FlowIntent =
    | 'GOTO_CLASSROOM'
    | 'GOTO_COMMUNITY'
    | 'GOTO_SELF'
    | 'GOTO_THUTHIMAL_CLAIM';

export interface FlowResult {
    outcome: FlowOutcome;
    message: string;
    intent?: FlowIntent;
    params?: any;
    error?: any;
}

/**
 * FlowResolver
 * 
 * Central orchestrator for "Intent-to-Action" journeys.
 * Handles parsing, validation, and execution for:
 * - QR Scans
 * - Deep Links
 * - Manual Invite Codes
 */
export class FlowResolver {
    /**
     * Resolve a QR payload into a system action.
     */
    static async resolveQR(payload: QRPayload, userId: string): Promise<FlowResult> {
        try {
            switch (payload.action) {
                case 'join_school':
                    return await this.executeJoinSchool(payload.school_id, payload.group_id, userId);

                case 'join_class':
                    return await this.executeJoinClass(payload.classroom_id, userId);

                case 'join_group':
                    return await this.executeJoinGroup(payload.group_id, userId);

                case 'claim_invite':
                    return await this.executeClaimInvite(payload.invite_code, payload.school_id, payload.role as UserRole, userId);

                case 'user_invite':
                    return {
                        outcome: 'success',
                        message: "Welcome! Referral attribution stored.",
                        intent: 'GOTO_SELF'
                    };

                case 'thuthimal_gift':
                    return {
                        outcome: 'redirect',
                        message: "Redirecting to Thuthimal claim...",
                        intent: 'GOTO_THUTHIMAL_CLAIM',
                        params: { gift_token: payload.gift_token, gifter_name: payload.gifter_name }
                    };

                default:
                    return { outcome: 'error', message: 'Unknown action' };
            }
        } catch (error: any) {
            console.error('[FlowResolver] Execution error:', error);
            return { outcome: 'error', message: error.message || 'Action failed', error };
        }
    }

    private static async executeJoinSchool(schoolId: string, groupId: string, userId: string): Promise<FlowResult> {
        // 1. Update user's school association
        const { error: userError } = await supabase
            .from('users')
            .update({ school_id: schoolId })
            .eq('id', userId);

        if (userError) throw userError;

        // 2. Join the automated school community group
        // Note: Using raw supabase here to avoid cross-package circularity if communityAPI depends on core
        const { error: groupError } = await supabase
            .from('group_members')
            .upsert({
                group_id: groupId,
                user_id: userId,
                status: 'active',
                is_admin: false
            });

        if (groupError) console.warn('[FlowResolver] Group join warning:', groupError);

        return {
            outcome: 'success',
            message: 'Successfully joined school and community!',
            intent: 'GOTO_CLASSROOM'
        };
    }

    private static async executeJoinClass(classroomId: string, userId: string): Promise<FlowResult> {
        // Look up the user's role so we can route correctly
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        const role = userData?.role ?? 'student';

        if (role === 'student') {
            // Students join via the classroom_students membership table
            const { error } = await supabase
                .from('classroom_students')
                .upsert(
                    { classroom_id: classroomId, student_id: userId },
                    { onConflict: 'classroom_id,student_id' },
                );
            if (error) throw error;
        } else {
            // Teachers/staff: only claim teacher_id if the classroom has no teacher yet.
            // Never overwrite an existing teacher_id — that would steal classroom ownership.
            const { data: classroom, error: fetchError } = await supabase
                .from('classrooms')
                .select('teacher_id')
                .eq('id', classroomId)
                .single();

            if (fetchError) throw fetchError;

            if (!classroom?.teacher_id) {
                // Unclaimed classroom — claim atomically, only if still null
                const { data: claimed, error: updateError } = await supabase
                    .from('classrooms')
                    .update({ teacher_id: userId })
                    .eq('id', classroomId)
                    .is('teacher_id', null)
                    .select('id');
                if (updateError) throw updateError;
                // If 0 rows were updated another teacher claimed it first — navigate as a visitor
                if (!claimed || claimed.length === 0) {
                    return {
                        outcome: 'success',
                        message: 'Joined classroom. Ownership was already claimed by another teacher.',
                        intent: 'GOTO_CLASSROOM'
                    };
                }
            }
            // If classroom already has a teacher, just navigate — no ownership change.
        }

        return {
            outcome: 'success',
            message: 'Joined classroom successfully!',
            intent: 'GOTO_CLASSROOM'
        };
    }

    private static async executeJoinGroup(groupId: string, userId: string): Promise<FlowResult> {
        const { error } = await supabase
            .from('group_members')
            .upsert({
                group_id: groupId,
                user_id: userId,
                status: 'active'
            });

        if (error) throw error;

        return {
            outcome: 'success',
            message: 'Joined community group!',
            intent: 'GOTO_COMMUNITY'
        };
    }

    private static async executeClaimInvite(inviteCode: string, schoolId: string, role: UserRole, userId: string): Promise<FlowResult> {
        try {
            console.log(`[FlowResolver] Executing transactional invite claim for code: ${inviteCode}`);

            // Atomic RPC call
            const { data, error } = await supabase.rpc('claim_invite_code', {
                p_invite_code: inviteCode,
                p_user_id: userId
            });

            if (error) throw error;
            if (data && !data.success) {
                return { outcome: 'error', message: data.message || 'Failed to claim invite' };
            }

            return {
                outcome: 'success',
                message: `Welcome to the school as a ${role}!`,
                intent: 'GOTO_CLASSROOM'
            };
        } catch (error: any) {
            console.error('[FlowResolver] Claim error:', error);
            return { outcome: 'error', message: error.message || 'Claim failed', error };
        }
    }
}
