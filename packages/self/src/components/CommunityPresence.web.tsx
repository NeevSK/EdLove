/**
 * CommunityPresence.web.tsx
 *
 * Web override. Uses the same Supabase realtime presence + DB fallback logic
 * as the native version but replaces RN Animated with CSS animations.
 * Metro resolves this over CommunityPresence.tsx on the web platform.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePermissions, supabase } from '@repo/core';
import { Users, WifiOff } from 'lucide-react-native';

interface CommunityPresenceProps {
    compact?: boolean;
    userId: string;
}

export default function CommunityPresence({ compact = false, userId }: CommunityPresenceProps) {
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const { can, context } = usePermissions();
    const userRole = context.roles[0] || 'student';

    const { targetRoles, channelName, isCumulative } = useMemo(() => {
        if (can('manage', 'PrincipalDashboard')) return { targetRoles: ['teacher','student','section_head','grade_head','principal','developer'], channelName: 'presence:school', isCumulative: true };
        if (can('manage', 'TeacherDashboard')) return { targetRoles: ['teacher','section_head','grade_head','principal'], channelName: 'presence:educators', isCumulative: false };
        return { targetRoles: ['student'], channelName: 'presence:students', isCumulative: false };
    }, [can]);

    const fetchCount = useCallback(async () => {
        try {
            const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            let q = supabase.from('users').select('id', { count: 'exact', head: true }).gte('last_seen_at', fiveMinAgo);
            if (!isCumulative) q = q.in('role', targetRoles);
            const { count: n } = await q;
            setCount(n ?? 0);
            setIsOffline(false);
        } catch { setIsOffline(true); }
        finally { setIsLoading(false); }
    }, [targetRoles, isCumulative]);

    useEffect(() => {
        fetchCount();
        if (userId) supabase.from('users').update({ last_seen_at: new Date().toISOString() }).eq('id', userId).then(() => {});

        const ch = supabase.channel(channelName).on('presence', { event: 'sync' }, fetchCount).subscribe();
        const selfCh = supabase.channel(`self:${userId}`).subscribe(async status => {
            if (status === 'SUBSCRIBED' && userId) {
                await selfCh.track({ userId, role: userRole, online_at: new Date().toISOString() });
            }
        });

        const interval = setInterval(fetchCount, 60000);
        return () => {
            supabase.removeChannel(ch);
            supabase.removeChannel(selfCh);
            clearInterval(interval);
        };
    }, [channelName, fetchCount, userId, userRole]);

    const label = userRole === 'student' ? 'peers' : isCumulative ? 'school members' : 'educators';

    if (compact) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOffline ? '#6B7280' : '#22C55E', animation: isOffline ? 'none' : 'pulse 2s infinite' }} />
                <span style={{ fontSize: '11px', color: 'var(--ink-ghost)', fontWeight: '600' }}>
                    {isLoading ? '' : isOffline ? 'Offline' : `  online`}
                </span>
                <style>{@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--background-alt)', borderRadius: '12px' }}>
            {isOffline ? <WifiOff size={16} color="var(--ink-ghost)" /> : <Users size={16} color="#22C55E" />}
            <div>
                <div style={{ fontSize: '12px', fontWeight: '700' }}>
                    {isLoading ? 'Checking presence' : isOffline ? 'Offline' : `  online`}
                </div>
                {!isOffline && !isLoading && count > 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>You are not alone in this.</div>
                )}
            </div>
            <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: isOffline ? '#6B7280' : '#22C55E', animation: isOffline ? 'none' : 'pulse 2s infinite' }} />
            <style>{@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }}</style>
        </div>
    );
}
