import { PostgrestFilterBuilder } from '@supabase/postgrest-js';


import { useResonanceStore } from '../store/useResonanceStore';


/**
 * Temporal Utilities
 * 
 * Provides standardized logic for day-based temporal filtering across the application.
 */

import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, formatISO } from 'date-fns';

export interface TemporalRange {
    start: string; // ISO string 
    end: string;   // ISO string
}

/**
 * Generates ISO strings for a specific temporal scale.
 */

export const getTemporalRange = (dateStr: string, scale: 'day' | 'week' | 'month' | 'year' = 'day'): TemporalRange => {
    const date = parseISO(dateStr);
    
    let start: Date;
    let end: Date;

    switch (scale) {
        case 'week':
            start = startOfWeek(date);
            end = endOfWeek(date);
            break;
        case 'month':
            start = startOfMonth(date);
            end = endOfMonth(date);
            break;
        case 'year':
            start = startOfYear(date);
            end = endOfYear(date);
            break;
        case 'day':
        default:
            start = startOfDay(date);
            end = endOfDay(date);
            break;
    }
    
    return {
        start: formatISO(start),
        end: formatISO(end)
    };
};


/**
 * Higher-order utility to apply a resonance filter to any Supabase query.
 * 
 * Implements the "Temporal Lens" protocol:
 * 1. If in the past, filters by Valid Time (created_at).
 * 2. If in the present, returns latest data.
 * 3. Supports Transaction Time shielding.
 */
export function applyResonanceFilter<
    Schema = any,
    Table = any,
    Result = any
>(
    query: PostgrestFilterBuilder<any, any, any, any, any>,
    column: string = 'created_at'
) {
    const { resonanceDate, phase, viewScale } = useResonanceStore.getState();
    
    if (phase === 'present') return query;

    const { start, end } = getTemporalRange(resonanceDate, viewScale === 'custom' ? 'day' : viewScale);
    
    // Valid Time filtering: Ensure we only see things that existed at the resonance point
    return query.gte(column, start).lte(column, end);
}

/**
 * Bi-temporal utility: Returns a range for Transaction Time analysis.
 */
export const getTransactionRange = (validDate: string): TemporalRange => {
    // In a true bi-temporal system, we might look for the state recorded 
    // nearest to the valid date. For now, we align with Valid Time.
    return getTemporalRange(validDate);
};

