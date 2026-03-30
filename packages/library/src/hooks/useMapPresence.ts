import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@repo/core';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface MapPresence {
    userId: string;
    latitude?: number;
    longitude?: number;
    map_x?: number;
    map_y?: number;
    vibe: string;
    role: string;
    lastSeen: string;
}

/**
 * useMapPresence Hook
 * Subscribes to realtime presence for the current map view.
 * Enables the "Community Aura" feature.
 */
export function useMapPresence(channelName: string = 'presence:map:global') {
    const [presences, setPresences] = useState<MapPresence[]>([]);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        const channel = supabase.channel(channelName);
        channelRef.current = channel;

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const flattened: MapPresence[] = Object.values(state).flat() as any;

                // Only keep presences that have some coordinate data
                setPresences(flattened.filter(p =
                    (p.latitude !== undefined && p.longitude !== undefined) ||
                    (p.map_x !== undefined && p.map_y !== undefined)
                ));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [channelName]);

    /**
     * Update current user's location on the map presence channel.
     */
    const updateLocation = useCallback(async (location: {
        latitude?: number;
        longitude?: number;
        map_x?: number;
        map_y?: number;
        vibe: string;
        role: string;
        userId: string;
    }) => {
        if (!channelRef.current) return;

        // Privacy: Round coordinates to protected precisions
        const payload: Partial<MapPresence> = {
            userId: location.userId,
            latitude: location.latitude ? Math.round(location.latitude * 1000) / 1000 : undefined,
            longitude: location.longitude ? Math.round(location.longitude * 1000) / 1000 : undefined,
            map_x: location.map_x,
            map_y: location.map_y,
            vibe: location.vibe,
            role: location.role,
            lastSeen: new Date().toISOString()
        };

        try {
            await channelRef.current.track(payload);
        } catch (error) {
            console.error('Failed to track map presence:', error);
        }
    }, []);

    return { presences, updateLocation };
}
