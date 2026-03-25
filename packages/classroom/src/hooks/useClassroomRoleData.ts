import { useState, useEffect, useCallback } from 'react';
import { supabase, usePermissions, AuthorityTier, useStore } from '@repo/core';

export interface ClassroomRoleData {
    userId: string;
    schoolId: string | null;
    profileCompleted: boolean;
    realClassCount: number;
}

export function useClassroomRoleData(refreshTrigger: number = 0) {
    const { context } = usePermissions();
    const { roles, userId, schoolId } = context;
    const role = roles[0];
    const { realClassCount: storeClassCount, setRealClassCount, setUser, user: localUser } = useStore();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ClassroomRoleData | null>(null);

    const fetchData = useCallback(async () => {
        // 1. Instant Hydration: Prepare initial data from local store
        if (!userId) {
            setData(null);
            setLoading(false);
            return;
        }

        // Set initial data immediately so UI doesn't wait
        setData(prev => {
            const currentClassCount = storeClassCount !== null ? storeClassCount : (prev?.realClassCount || 0);
            
            if (prev && prev.userId === userId && prev.schoolId === schoolId && prev.profileCompleted === !!localUser?.profile_completed && prev.realClassCount === currentClassCount) {
                return prev;
            }
            return {
                userId,
                schoolId,
                profileCompleted: !!localUser?.profile_completed,
                realClassCount: currentClassCount
            };
        });

        try {
            // 2. Background Sync: Fetch from network
            let realClassCount = 0;

            // Parallel fetch for speed
            const [classesCheck, profileCheck] = await Promise.all([
                // Fetch counts based on role
                role === 'student'
                    ? supabase.from('classroom_students').select('*', { count: 'exact', head: true }).eq('student_id', userId)
                    : role === 'teacher'
                        ? supabase.from('classrooms').select('*', { count: 'exact', head: true }).eq('teacher_id', userId)
                        : Promise.resolve({ count: 0 }),

                // Verify profile status in background
                supabase
                    .from('users')
                    .select('school_id, profile_completed, role, full_name, email, platform_roles, school_role, work_roles, tenant_kind')
                    .eq('id', userId)
                    .maybeSingle()
            ]);

            realClassCount = classesCheck.count || 0;

            // Update store if server data is newer/different (Convergence)
            if (profileCheck.data) {
                const serverUser = profileCheck.data;
                // Strict comparison to prevent loop
                const hasSignificantChanges = 
                    serverUser.profile_completed !== localUser?.profile_completed || 
                    serverUser.school_id !== localUser?.school_id ||
                    serverUser.role !== localUser?.authority ||
                    JSON.stringify(serverUser.platform_roles) !== JSON.stringify((localUser as any)?.platform_authorities) ||
                    serverUser.school_role !== (localUser as any)?.school_authority ||
                    JSON.stringify(serverUser.work_roles) !== JSON.stringify((localUser as any)?.work_capacities) ||
                    serverUser.tenant_kind !== (localUser as any)?.tenant_kind ||
                    serverUser.full_name !== localUser?.full_name ||
                    serverUser.email !== localUser?.email;
                                  
                if (hasSignificantChanges) {
                    console.log('🔄 useClassroomRoleData: Syncing user data from server (Changes detected)');
                    setUser({ ...localUser, ...serverUser, id: userId } as any);
                }
            }

            // Sync class count back to store if different
            if (realClassCount !== storeClassCount) {
                setRealClassCount(realClassCount);
            }

            setData({
                userId,
                schoolId: profileCheck.data?.school_id || schoolId,
                profileCompleted: !!profileCheck.data?.profile_completed,
                realClassCount
            });
        } catch (error) {
            console.error('Error syncing classroom role data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, schoolId, role, setUser, setRealClassCount, storeClassCount, localUser?.profile_completed, localUser?.school_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshTrigger]);

    return { data, loading, fetchRoleData: fetchData };
}
