import { getTemporalRange, supabase } from '@repo/core';
import type { EnergyForecast } from '../types';

export interface PresenceFallbackCountOptions {
    targetRoles: string[];
    isCumulative: boolean;
    userId?: string;
    windowMs?: number;
}

export interface PresenceSessionOptions {
    userId: string;
    userRole: string;
    userVibe?: string;
    channelName: string;
    onCountChange: (count: number) => void;
    onOfflineChange: (offline: boolean) => void;
}

export async function fetchEnergyForecastsForView(
    userId: string,
    options: { viewDate: string; isPastView: boolean }
): Promise<EnergyForecast[]> {
    let query = supabase
        .from('energy_forecasts')
        .select('*')
        .eq('user_id', userId);

    if (options.isPastView) {
        query = query.eq('forecast_date', options.viewDate);
    } else {
        query = query.order('forecast_date', { ascending: false }).limit(7);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data ?? [];
}

export async function saveEnergyForecastForDate(
    userId: string,
    payload: {
        forecastDate: string;
        energyLevel: EnergyForecast['energy_level'];
        notes?: string;
        existingId?: string;
    }
): Promise<void> {
    const updatePayload = {
        energy_level: payload.energyLevel,
        notes: payload.notes ?? '',
    };

    if (payload.existingId) {
        const { error } = await supabase
            .from('energy_forecasts')
            .update(updatePayload)
            .eq('id', payload.existingId);

        if (error) throw error;
        return;
    }

    const { data: existing, error: existingError } = await supabase
        .from('energy_forecasts')
        .select('id')
        .eq('user_id', userId)
        .eq('forecast_date', payload.forecastDate)
        .maybeSingle();

    if (existingError) throw existingError;

    if (existing?.id) {
        const { error } = await supabase
            .from('energy_forecasts')
            .update(updatePayload)
            .eq('id', existing.id);

        if (error) throw error;
        return;
    }

    const { error } = await supabase
        .from('energy_forecasts')
        .insert({
            user_id: userId,
            forecast_date: payload.forecastDate,
            ...updatePayload,
        });

    if (error) throw error;
}

export async function fetchInteractionCountForView(
    userId: string,
    options: { viewDate: string; isPastView: boolean }
): Promise<number> {
    const range = options.isPastView ? getTemporalRange(options.viewDate, 'day') : null;

    let moodQuery = supabase
        .from('mood_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

    let fireQuery = supabase
        .from('fire_journal')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (range) {
        moodQuery = moodQuery.lte('created_at', range.end);
        fireQuery = fireQuery.lte('created_at', range.end);
    }

    const [moodRes, fireRes] = await Promise.all([moodQuery, fireQuery]);

    return (moodRes.count ?? 0) + (fireRes.count ?? 0);
}

export async function fetchPresenceFallbackCount(
    options: PresenceFallbackCountOptions
): Promise<number> {
    const fiveMinutesAgo = new Date(Date.now() - (options.windowMs ?? 5 * 60 * 1000)).toISOString();
    let query = supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('last_seen_at', fiveMinutesAgo);

    if (!options.isCumulative) {
        query = query.in('role', options.targetRoles);
    } else if (options.userId && options.userId !== 'guest') {
        query = query.neq('id', options.userId);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count ?? 0;
}

export async function markUserPresenceSeen(userId: string): Promise<void> {
    const { error } = await supabase
        .from('users')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) throw error;
}

export function startPresenceSession(options: PresenceSessionOptions): () => void {
    const selfChannel = supabase.channel(`presence:self:${options.userRole}`);
    const watcherChannel = supabase.channel(options.channelName);

    selfChannel.subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        try {
            await markUserPresenceSeen(options.userId);
            await selfChannel.track({
                user_id: options.userId,
                vibe: options.userVibe ?? 'active',
                online_at: new Date().toISOString(),
            });
        } catch {
            options.onOfflineChange(true);
        }
    });

    watcherChannel
        .on('presence', { event: 'sync' }, () => {
            const state = watcherChannel.presenceState();
            const presences = Object.values(state).flat();
            options.onCountChange(presences.length);
            options.onOfflineChange(false);
        })
        .on('presence', { event: 'join' }, () => {
            options.onOfflineChange(false);
        })
        .subscribe((status) => {
            if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                options.onOfflineChange(true);
            }
        });

    return () => {
        supabase.removeChannel(selfChannel);
        supabase.removeChannel(watcherChannel);
    };
}
