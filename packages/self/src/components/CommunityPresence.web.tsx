/**
 * CommunityPresence.web.tsx
 *
 * Web override. Uses the shared self presence hook and keeps the web UI
 * focused on rendering only.
 */
import React from 'react';
import { Users, WifiOff } from 'lucide-react-native';
import { useCommunityPresence } from '../hooks/useCommunityPresence';

interface CommunityPresenceProps {
    compact?: boolean;
    userId: string;
}

export default function CommunityPresence({ compact = false, userId }: CommunityPresenceProps) {
    const { onlineCount, isLoading, isOffline, perspective } = useCommunityPresence({ userId });
    const label = perspective === 'student' ? 'peers' : perspective === 'principal' ? 'school members' : 'educators';

    if (compact) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOffline ? '#6B7280' : '#22C55E', animation: isOffline ? 'none' : 'pulse 2s infinite' }} />
                <span style={{ fontSize: '11px', color: 'var(--ink-ghost)', fontWeight: '600' }}>
                    {isLoading ? '' : isOffline ? 'Offline' : `${onlineCount} ${label} online`}
                </span>
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--background-alt)', borderRadius: '12px' }}>
            {isOffline ? <WifiOff size={16} color="var(--ink-ghost)" /> : <Users size={16} color="#22C55E" />}
            <div>
                <div style={{ fontSize: '12px', fontWeight: '700' }}>
                    {isLoading ? 'Checking presence' : isOffline ? 'Offline' : `${onlineCount} ${label} online`}
                </div>
                {!isOffline && !isLoading && onlineCount > 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>You are not alone in this.</div>
                )}
            </div>
            <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: isOffline ? '#6B7280' : '#22C55E', animation: isOffline ? 'none' : 'pulse 2s infinite' }} />
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
    );
}
