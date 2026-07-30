import { useBanyanGrowth, useNaturePaths } from '@repo/core/hooks';
import { usePermissions, useTemporalStore } from '@repo/core/logic';

import { useMemo } from 'react';
import { useDecisionJournal } from '@repo/self/hooks/useDecisionJournal';
import { useEnergyForecast } from '@repo/self/hooks/useEnergyForecast';
import { useJournalEntries } from '@repo/self/hooks/useJournalEntries';
import { useMoodLogs } from '@repo/self/hooks/useMoodLogs';
import { useWisdom } from '@repo/self/hooks/useWisdom';

export interface JourneyEvent {
  id: string;
  type: 'mood' | 'journal' | 'growth' | 'path' | 'decision' | 'wisdom' | 'energy';
  timestamp: string;
  title: string;
  content?: string;
  metadata?: any;
  intensity: number;
}

/**
 * useJourneyData
 *
 * Aggregates multiple temporal data streams into a single chronological journey.
 * Following the DTM (Decentralized Temporal Mirror) pattern, this hook
 * coordinates across specialized hooks to present a unified "Journey Path".
 *
 * Role-Aware: Aggregates different streams based on whether the user is a
 * Student, Teacher, Principal, or Founder.
 */
export const useJourneyData = () => {
  const { viewDate, viewMode, timelineFocus } = useTemporalStore();
  const { can, context } = usePermissions();
  const { userId } = context;

  // 1. Core Streams (Shared by all)
  const { logs: moodLogs, loading: loadingMoods } = useMoodLogs(userId || undefined);
  const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();

  // 2. Role-Specific Streams
  const { paths: studentPaths, isLoading: loadingStudentPaths } = useNaturePaths(); // Student focus
  const { banyan: banyanGrowth, isLoading: loadingBanyan } = useBanyanGrowth(); // Teacher/Principal focus
  const { forecasts: energyForecasts, isLoading: loadingEnergy } = useEnergyForecast(
    userId || undefined,
  ); // Principal/Teacher focus
  const { decisions, isLoading: loadingDecisions } = useDecisionJournal(userId || undefined); // Principal focus
  const { notes: wisdomNotes, isLoading: loadingWisdom } = useWisdom(userId || undefined); // Founder focus

  const journey = useMemo(() => {
    if (viewMode !== 'timeline') return [];

    const events: JourneyEvent[] = [];

    // --- Core: Mood ---
    moodLogs.forEach((log: any) => {
      events.push({
        id: log.id,
        type: 'mood',
        timestamp: log.created_at,
        title: `Mood: ${log.mood_type}`,
        content: log.note,
        intensity: log.intensity || 0.5,
        metadata: { mood_type: log.mood_type },
      });
    });

    // --- Core: Journal ---
    journalEntries.forEach((entry: any) => {
      events.push({
        id: entry.id,
        type: 'journal',
        timestamp: entry.created_at,
        title: entry.title || 'Reflective Journal',
        content: entry.content,
        intensity: 0.8,
        metadata: { category: entry.category },
      });
    });

    // --- Role-Aware: Student Path ---
    if (can('manage', 'StudentDashboard') && studentPaths) {
      events.push({
        id: `river-${studentPaths.river_stage}`,
        type: 'path',
        timestamp: viewDate,
        title: `River Flow: ${studentPaths.river_stage}`,
        content: `Your learning has reached the ${studentPaths.river_stage} stage.`,
        intensity: 0.9,
        metadata: { stage: studentPaths.river_stage },
      });
    }

    // --- Role-Aware: Teacher/Principal Banyan ---
    if (can('manage', 'TeacherDashboard') && banyanGrowth) {
      events.push({
        id: `banyan-${banyanGrowth.banyan_stage}`,
        type: 'growth',
        timestamp: viewDate,
        title: `Banyan Growth: ${banyanGrowth.banyan_stage}`,
        content: `Your mentorship impact is in the ${banyanGrowth.banyan_stage} phase.`,
        intensity: 0.9,
        metadata: { stage: banyanGrowth.banyan_stage },
      });
    }

    // --- Role-Aware: Principal/Teacher Energy ---
    if (can('manage', 'TeacherDashboard')) {
      energyForecasts.forEach((forecast) => {
        events.push({
          id: forecast.id,
          type: 'energy',
          timestamp: forecast.forecast_date,
          title: `Energy Forecast: ${forecast.energy_level}`,
          content: forecast.notes,
          intensity: 0.7,
          metadata: { level: forecast.energy_level },
        });
      });
    }

    // --- Role-Aware: Principal Decisions ---
    if (can('manage', 'PrincipalDashboard')) {
      decisions.forEach((decision) => {
        events.push({
          id: decision.id,
          type: 'decision',
          timestamp: decision.created_at,
          title: `Strategic Decision`,
          content: decision.decision_text,
          intensity: 1.0,
          metadata: { context: decision.context },
        });
      });
    }

    // --- Role-Aware: Founder Wisdom ---
    if (can('manage', 'FounderDashboard')) {
      wisdomNotes.forEach((note) => {
        events.push({
          id: note.id,
          type: 'wisdom',
          timestamp: note.created_at,
          title: `Wisdom Log`,
          content: note.insight,
          intensity: 1.0,
          metadata: { tags: note.tags },
        });
      });
    }

    // --- Chronological Sort ---
    const sorted = events.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    // --- Genesis Node Injection ---
    if (sorted.length === 0) {
      sorted.push({
        id: 'genesis',
        type: 'path',
        timestamp: viewDate,
        title: 'JOURNEY STARTS HERE',
        content: 'The first pulse of your intentional resonance.',
        intensity: 1.0,
      });
    }

    // --- Focus Filter ---
    if (timelineFocus === 'all') return sorted;
    return sorted.filter((event) => event.type === timelineFocus);
  }, [
    moodLogs,
    journalEntries,
    studentPaths,
    banyanGrowth,
    energyForecasts,
    decisions,
    wisdomNotes,
    viewMode,
    viewDate,
    timelineFocus,
    can,
  ]);

  return {
    journey,
    loading:
      loadingMoods ||
      loadingJournals ||
      loadingStudentPaths ||
      loadingBanyan ||
      loadingEnergy ||
      loadingDecisions ||
      loadingWisdom,
  };
};
