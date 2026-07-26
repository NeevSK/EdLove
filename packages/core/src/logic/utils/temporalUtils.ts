import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatISO,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import {
  type TemporalCapability,
  type TemporalScale,
  useTemporalStore,
} from '@/store/useTemporalStore';

export interface TemporalRange {
  start: string; // ISO string
  end: string; // ISO string
}

export interface TemporalFilterSpec {
  column: string;
  mode: 'event_time' | 'business_date';
  scale?: TemporalScale;
  capability?: TemporalCapability;
}

/**
 * Generates ISO strings for a specific temporal scale.
 */

export const getTemporalRange = (dateStr: string, scale: TemporalScale = 'day'): TemporalRange => {
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
    default:
      start = startOfDay(date);
      end = endOfDay(date);
      break;
  }

  return {
    start: formatISO(start),
    end: formatISO(end),
  };
};

/**
 * Higher-order utility to apply temporal filtering to a query builder.
 *
 * Important guardrail: timestamps alone are not equivalent to historical truth.
 * Only event streams, business facts, and audit histories should be filtered here.
 */
export function applyTemporalFilter<_Schema = any, _Table = any, _Result = any>(
  query: PostgrestFilterBuilder<any, any, any, any, any>,
  spec: TemporalFilterSpec,
) {
  const { viewDate, phase, viewScale } = useTemporalStore.getState();

  if (phase === 'present' && spec.capability === 'snapshot') {
    return query;
  }

  if (
    spec.capability &&
    !['event_stream', 'business_fact', 'audit_history'].includes(spec.capability)
  ) {
    return query;
  }

  const scale = spec.scale ?? viewScale;
  const { start, end } = getTemporalRange(viewDate, scale === 'custom' ? 'day' : scale);

  if (spec.mode === 'business_date') {
    const startDate = start.split('T')[0] || start;
    const endDate = end.split('T')[0] || end;
    return query.gte(spec.column, startDate).lte(spec.column, endDate);
  }

  return query.gte(spec.column, start).lte(spec.column, end);
}

/**
 * Bi-temporal utility: Returns a range for Transaction Time analysis.
 */
export const getTransactionRange = (validDate: string): TemporalRange => {
  // In a true bi-temporal system, we might look for the state recorded
  // nearest to the valid date. For now, we align with Valid Time.
  return getTemporalRange(validDate);
};

export const getCurrentTimestamp = () => {
  return formatISO(new Date());
};
