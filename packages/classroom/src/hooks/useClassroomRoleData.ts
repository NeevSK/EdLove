import { useState, useEffect } from 'react';
import { supabase, useUserRole } from '@repo/core';

export interface ClassroomRoleData {
    userId: string;
    schoolId: string | null;
    profileCompleted: boolean;
    realClassCount: number;
}

export function useClassroomRoleData(refreshTrigger: number = 0) {
    const { role } = useUserRole();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ClassroomRoleData | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setData(null);
                return;
            }

            const { data: userData } = await supabase
                .from('users')
                .select('school_id, profile_completed')
                .eq('id', user.id)
                .maybeSingle();

            let realClassCount = 0;
            if (role === 'student') {
                const { count } = await supabase
                    .from('classroom_students')
                    .select('*', { count: 'exact', head: true })
                    .eq('student_id', user.id);
                realClassCount = count || 0;
            } else if (role === 'teacher') {
                const { count } = await supabase
                    .from('classrooms')
                    .select('*', { count: 'exact', head: true })
                    .eq('teacher_id', user.id);
                realClassCount = count || 0;
            }

            setData({
                userId: user.id,
                schoolId: userData?.school_id || null,
                profileCompleted: !!userData?.profile_completed,
                realClassCount
            });
        } catch (error) {
            console.error('Error fetching classroom role data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [role, refreshTrigger]);

    return { data, loading, fetchRoleData: fetchData };
}
